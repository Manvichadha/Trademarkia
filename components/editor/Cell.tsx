"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { getDisplayValue, isFormulaCell } from "@/lib/spreadsheet/engine";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useCellSelection } from "@/hooks/useCellSelection";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";

const ROW_HEIGHT = 28;

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
}

function formatDisplayValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  return String(value);
}

export function Cell({ row, col, width = 100, height = 28, updatedBy, heatMap, forceEdit, onEditDone, onCellMouseDown, onCellMouseEnter }: CellProps) {
  const cellId = toCellId({ row, col });
  const { sheet, updateCell } = useSpreadsheet(updatedBy);
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
      setShowShimmer(true);
      const timer = setTimeout(() => setShowShimmer(false), 600);
      prevUpdatedByRef.current = cell.updatedBy;
      return () => clearTimeout(timer);
    }
    if (cell?.updatedBy) {
      prevUpdatedByRef.current = cell.updatedBy;
    }
  }, [cell?.updatedBy, updatedBy]);

  // Commit pulse ripple when this user saves
  useEffect(() => {
    if (cell?.updatedBy === updatedBy) {
      setCommitPulse(true);
      const t = setTimeout(() => setCommitPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [cell?.updatedAt, cell?.updatedBy, updatedBy]);

  // Heat map rAF loop: fade from bright green → transparent over 30s
  useEffect(() => {
    if (!heatMap || !cell?.updatedAt) {
      setHeatOpacity(0);
      return;
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

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!editing) {
      selectCell(row, col);
    }
  }, [row, col, selectCell, editing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    onCellMouseDown?.(row, col, e);
  }, [row, col, onCellMouseDown]);

  const handleMouseEnter = useCallback(() => {
    onCellMouseEnter?.(row, col);
  }, [row, col, onCellMouseEnter]);

  const handleDoubleClick = useCallback(() => {
    setEditValue(cell?.raw ?? "");
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [cell?.raw]);

  // Enter edit mode when forced by keyboard nav (F2 / Enter)
  useEffect(() => {
    if (forceEdit && !editing) {
      setEditValue(cell?.raw ?? "");
      setEditing(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [forceEdit, editing, cell?.raw]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    onEditDone?.();
    const trimmed = editValue.trim();
    if (trimmed !== (cell?.raw ?? "")) {
      updateCell(cellId, trimmed);
    }
  }, [editValue, cell?.raw, cellId, updateCell, onEditDone]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    [editValue, cell?.raw, cellId, updateCell, onEditDone]
  );

  useEffect(() => {
    if (editing) {
      setEditValue(cell?.raw ?? "");
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
          onChange={(e) => setEditValue(e.target.value)}
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
