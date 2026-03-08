"use client";

import { useState, useRef, useEffect } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { getDisplayValue, isFormulaCell } from "@/lib/spreadsheet/engine";
import { useCellSelection } from "@/hooks/useCellSelection";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import type { CellFormatting } from "@/lib/spreadsheet/types";

interface CellProps {
  row: number;
  col: number;
  width?: number;
  height?: number;
  updatedBy: string;
  heatMap?: boolean;
  forceEdit?: boolean;
  onEditDone?: () => void;
  onCellMouseDown?: (row: number, col: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  updateCell: (cellId: string, raw: string, formatting?: Partial<CellFormatting>) => void;
}

function formatDisplayValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
}

export function Cell({ row, col, width = 100, height = 28, updatedBy, heatMap, forceEdit, onEditDone, onCellMouseDown, onCellMouseEnter, updateCell }: CellProps) {
  const cellId = toCellId({ row, col });
  const sheet = useSpreadsheetStore((state) => state.sheet);
  const { isCellSelected, isActiveCell, selectCell } = useCellSelection();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [showShimmer, setShowShimmer] = useState(false);
  const [heatOpacity, setHeatOpacity] = useState(0);
  const [commitPulse, setCommitPulse] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUpdatedByRef = useRef<string | null>(null);
  const heatRafRef = useRef<number | null>(null);

  const cell = sheet[cellId];
  const displayValue = cell ? getDisplayValue(sheet, cellId) : null;
  const hasFormula = cell ? isFormulaCell(sheet, cellId) : false;
  const selected = isCellSelected(row, col);
  const active = isActiveCell(row, col);
  const formatting = cell?.formatting ?? {};

  // Trigger shimmer animation when another user updates this cell
  useEffect(() => {
    if (cell?.updatedBy && cell.updatedBy !== prevUpdatedByRef.current && cell.updatedBy !== updatedBy) {
      const t1 = setTimeout(() => setShowShimmer(true), 0);
      const t2 = setTimeout(() => setShowShimmer(false), 600);
      prevUpdatedByRef.current = cell.updatedBy;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (cell?.updatedBy) {
      prevUpdatedByRef.current = cell.updatedBy;
    }
  }, [cell?.updatedBy, updatedBy]);

  // Commit pulse ripple when this user saves
  useEffect(() => {
    if (cell?.updatedBy === updatedBy) {
      const t1 = setTimeout(() => setCommitPulse(true), 0);
      const t2 = setTimeout(() => setCommitPulse(false), 500);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [cell?.updatedAt, cell?.updatedBy, updatedBy]);

  // Heat map rAF loop: fade from bright green → transparent over 30s
  useEffect(() => {
    if (!heatMap || !cell?.updatedAt) {
      const t = setTimeout(() => setHeatOpacity(0), 0);
      return () => clearTimeout(t);
    }
    const update = () => {
      const age = Date.now() - cell.updatedAt;
      const MAX_AGE = 30_000; // 30s
      const opacity = Math.max(0, 1 - age / MAX_AGE);
      setHeatOpacity(opacity);
      if (opacity > 0) {
        heatRafRef.current = requestAnimationFrame(update);
      }
    };
    heatRafRef.current = requestAnimationFrame(update);
    return () => {
      if (heatRafRef.current !== null) cancelAnimationFrame(heatRafRef.current);
    };
  }, [heatMap, cell?.updatedAt]);

  const handleClick = () => {
    if (!editing) {
      selectCell(row, col);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    onCellMouseDown?.(row, col, e);
  };

  const handleMouseEnter = () => {
    onCellMouseEnter?.(row, col);
  };

  const handleDoubleClick = () => {
    setEditValue(cell?.raw ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Enter edit mode when forced by keyboard nav (F2 / Enter)
  useEffect(() => {
    if (forceEdit && !editing) {
      const t = setTimeout(() => {
        setEditValue(cell?.raw ?? "");
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [forceEdit, editing, cell?.raw]);

  const handleBlur = () => {
    setEditing(false);
    onEditDone?.();
    const trimmed = editValue.trim();
    if (trimmed !== (cell?.raw ?? "")) {
      updateCell(cellId, trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const trimmed = editValue.trim();
      if (trimmed !== (cell?.raw ?? "")) {
        updateCell(cellId, trimmed);
      }
      setEditing(false);
      onEditDone?.();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      setEditValue(cell?.raw ?? "");
      setEditing(false);
      onEditDone?.();
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    if (editing) {
      const t = setTimeout(() => setEditValue(cell?.raw ?? ""), 0);
      return () => clearTimeout(t);
    }
  }, [editing, cell?.raw]);

  const style: React.CSSProperties = {
    minWidth: width,
    maxWidth: width,
    height,
    minHeight: height,
    ...(formatting.bold && { fontWeight: 700 }),
    ...(formatting.italic && { fontStyle: "italic" }),
    ...(formatting.color && { color: formatting.color }),
    ...(formatting.bgColor && formatting.bgColor !== "transparent" && { backgroundColor: formatting.bgColor }),
    ...(formatting.align && { textAlign: formatting.align }),
    ...(heatMap && heatOpacity > 0 && !formatting.bgColor && {
      backgroundColor: `rgba(22, 163, 74, ${heatOpacity * 0.35})`,
    }),
  };

  return (
    <div
      role="gridcell"
      tabIndex={-1}
      aria-label={`Cell ${cellId}`}
      className={`relative flex items-center overflow-hidden border-b border-r border-border-subtle px-2 py-0.5 text-sm ${
        selected && !active ? "bg-primary/8" : "bg-surface-1"
      } ${active ? "cell-selection-glow z-10" : ""} ${showShimmer ? "shimmer-flash" : ""} ${commitPulse ? "commit-pulse" : ""} ${heatMap ? "heat-cell" : ""}`}
      style={style}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onDoubleClick={handleDoubleClick}
    >
      {hasFormula && !editing && (
        <span
          className="absolute left-0.5 top-0.5 h-2 w-2 rounded-sm bg-accent-success"
          aria-hidden
        />
      )}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => {
            const val = e.target.value;
            setEditValue(val);
            updateCell(cellId, val);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-full w-full min-w-0 border-0 bg-transparent px-0 py-0 text-inherit outline-none"
          autoFocus
        />
      ) : (
        <span className="truncate font-mono text-text-primary">
          {formatDisplayValue(displayValue)}
        </span>
      )}
    </div>
  );
}
