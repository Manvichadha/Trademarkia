"use client";

import { useCellSelection } from "@/hooks/useCellSelection";

const ROW_HEIGHT = 28;

interface RowHeaderProps {
  row: number;
  height?: number;
}

export function RowHeader({ row, height = ROW_HEIGHT }: RowHeaderProps) {
  const { activeCell, selectCell } = useCellSelection();
  const isActive = activeCell !== null && activeCell.row === row;

  return (
    <div
      role="rowheader"
      aria-label={`Row ${row + 1}`}
      className={`flex min-h-[${height}px] min-w-12 cursor-pointer items-center justify-end border-b border-r border-border-subtle bg-surface-2 px-2 font-mono text-xs text-text-secondary transition-colors hover:bg-surface-3 ${
        isActive ? "bg-primary/20 text-primary" : ""
      }`}
      style={{ minHeight: height }}
      onClick={() => selectCell(row, 0)}
    >
      {row + 1}
    </div>
  );
}
