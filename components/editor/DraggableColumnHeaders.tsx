"use client";

/**
 * DraggableColumnHeaders
 *
 * Wraps the column header row in a @dnd-kit DndContext with SortableContext.
 * Drag a column header to reorder; drops trigger onReorder callback.
 * Visual: dragged column is semi-transparent, drop target shows a blue insertion line.
 *
 * Formula reference remapping is handled by remapColumnReferences() below.
 */

import { useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import type { SheetData } from "@/lib/spreadsheet/types";

interface DraggableColumnHeadersProps {
  colOrder: number[];
  onReorder: (newOrder: number[]) => void;
  renderColumnHeader: (col: number, isDragging?: boolean) => React.ReactNode;
}

/** Reorder sheet cells to reflect the new column order, and remap formula references. */
function remapColumnReferences(
  sheet: SheetData,
  oldOrder: number[],
  newOrder: number[]
): SheetData {
  // Build a mapping: old physical col index → new physical col index
  const colMap: Record<number, number> = {};
  for (let i = 0; i < newOrder.length; i++) {
    // The header at position i was originally at position oldOrder[i]
    colMap[oldOrder[i]!] = i;
  }

  const remapped: SheetData = {};
  for (const [cellId, data] of Object.entries(sheet)) {
    const match = /^([A-Z]+)(\d+)$/.exec(cellId);
    if (!match) { remapped[cellId] = data; continue; }
    const colStr = match[1]!;
    const rowStr = match[2]!;
    let colIdx = 0;
    for (let i = 0; i < colStr.length; i++) {
      colIdx = colIdx * 26 + (colStr.charCodeAt(i) - 64);
    }
    colIdx -= 1;
    const newColIdx = colMap[colIdx] ?? colIdx;
    const newColStr = String.fromCharCode(65 + newColIdx);
    const newCellId = `${newColStr}${rowStr}`;

    // Remap formula references too
    let raw = data.raw;
    if (data.formula) {
      raw = data.formula.replace(/([A-Z]+)(\d+)/g, (_, c, r) => {
        let ci = 0;
        for (let i = 0; i < c.length; i++) ci = ci * 26 + (c.charCodeAt(i) - 64);
        ci -= 1;
        const nc = colMap[ci] ?? ci;
        return `${String.fromCharCode(65 + nc)}${r}`;
      });
    }

    remapped[newCellId] = {
      ...data,
      raw,
      formula: data.formula ? raw : null,
    };
  }
  return evaluateSheet(remapped);
}

interface SortableColProps {
  colId: string;
  children: React.ReactNode;
}

function SortableCol({ colId, children }: SortableColProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: colId });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        position: "relative",
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

export function DraggableColumnHeaders({
  colOrder,
  onReorder,
  renderColumnHeader,
}: DraggableColumnHeadersProps) {
  const { sheet, setSheet } = useSpreadsheetStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = colOrder.findIndex((c) => String(c) === active.id);
      const newIndex = colOrder.findIndex((c) => String(c) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newOrder = arrayMove(colOrder, oldIndex, newIndex);
      const remapped = remapColumnReferences(sheet, colOrder, newOrder);
      setSheet(remapped);
      onReorder(newOrder);
    },
    [colOrder, sheet, setSheet, onReorder]
  );

  const ids = colOrder.map(String);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        {colOrder.map((col) => (
          <SortableCol key={col} colId={String(col)}>
            {renderColumnHeader(col)}
          </SortableCol>
        ))}
      </SortableContext>
    </DndContext>
  );
}
