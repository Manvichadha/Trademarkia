"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { getDisplayValue, isFormulaCell } from "@/lib/spreadsheet/engine";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useCellSelection } from "@/hooks/useCellSelection";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";

const COL_WIDTH = 100;
const ROW_HEIGHT = 28;

interface CellProps {
  row: number;
  col: number;
  updatedBy: string;
}

function formatDisplayValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
}

export function Cell({ row, col, updatedBy }: CellProps) {
  const cellId = toCellId({ row, col });
  const { sheet, updateCell } = useSpreadsheet(updatedBy);
  const { isCellSelected, isActiveCell, selectCell } = useCellSelection();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cell = sheet[cellId];
  const displayValue = cell ? getDisplayValue(sheet, cellId) : null;
  const hasFormula = cell ? isFormulaCell(sheet, cellId) : false;
  const selected = isCellSelected(row, col);
  const active = isActiveCell(row, col);
  const formatting = cell?.formatting ?? {};

  const handleClick = useCallback(() => {
    selectCell(row, col);
  }, [row, col, selectCell]);

  const handleDoubleClick = useCallback(() => {
    setEditValue(cell?.raw ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [cell?.raw]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    const trimmed = editValue.trim();
    if (trimmed !== (cell?.raw ?? "")) {
      updateCell(cellId, trimmed);
    }
  }, [editValue, cell?.raw, cellId, updateCell]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const trimmed = editValue.trim();
        if (trimmed !== (cell?.raw ?? "")) {
          updateCell(cellId, trimmed);
        }
        setEditing(false);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setEditValue(cell?.raw ?? "");
        setEditing(false);
        inputRef.current?.blur();
      }
    },
    [editValue, cell?.raw, cellId, updateCell]
  );

  useEffect(() => {
    if (editing) {
      setEditValue(cell?.raw ?? "");
    }
  }, [editing, cell?.raw]);

  const style: React.CSSProperties = {
    minWidth: COL_WIDTH,
    maxWidth: COL_WIDTH,
    minHeight: ROW_HEIGHT,
    ...(formatting.bold && { fontWeight: 700 }),
    ...(formatting.italic && { fontStyle: "italic" }),
    ...(formatting.color && { color: formatting.color }),
    ...(formatting.bgColor && { backgroundColor: formatting.bgColor }),
    ...(formatting.align && { textAlign: formatting.align }),
  };

  return (
    <div
      role="gridcell"
      tabIndex={-1}
      aria-label={`Cell ${cellId}`}
      className={`relative flex items-center overflow-hidden border-b border-r border-border-subtle px-2 py-0.5 text-sm ${
        selected ? "bg-primary/10" : "bg-surface-1"
      } ${active ? "ring-2 ring-inset ring-primary" : ""}`}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {hasFormula && (
        <span
          className="absolute left-0.5 top-0.5 h-1.5 w-1.5 rounded-sm bg-accent-success"
          aria-hidden
        />
      )}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-full min-w-0 border-0 bg-transparent px-0 py-0 text-inherit outline-none"
        />
      ) : (
        <span className="truncate font-mono text-text-primary">
          {formatDisplayValue(displayValue)}
        </span>
      )}
    </div>
  );
}
