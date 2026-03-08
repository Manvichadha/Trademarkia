"use client";

import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { useCellSelection } from "@/hooks/useCellSelection";

const ROW_HEIGHT = 28;
const COL_WIDTH = 100;

interface ColumnHeaderProps {
  col: number;
  width?: number;
}

export function ColumnHeader({ col, width = COL_WIDTH }: ColumnHeaderProps) {
  const { activeCell, selectCell } = useCellSelection();
  const label = toCellId({ row: 0, col }).replace(/\d+/, "");
  const isActive = activeCell !== null && activeCell.col === col;

  return (
    <div
      role="columnheader"
      aria-label={`Column ${label}`}
      className={`flex h-full min-w-[${width}px] max-w-[${width}px] cursor-pointer items-center justify-center border-b border-r border-border-subtle bg-surface-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-3 ${
        isActive ? "bg-primary/20 text-primary" : ""
      }`}
      style={{ minWidth: width, maxWidth: width }}
      onClick={() => selectCell(0, col)}
    >
      {label}
    </div>
  );
}
