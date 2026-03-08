"use client";

import { useCellSelection } from "@/hooks/useCellSelection";

const ROW_HEIGHT = 28;
const HEADER_WIDTH = 48;

interface RowHeaderProps {
  row: number;
  height?: number;
  onResizeStart?: (row: number, startY: number) => void;
  isResizing?: boolean;
}

export function RowHeader({
  row,
  height = ROW_HEIGHT,
  onResizeStart,
  isResizing,
}: RowHeaderProps) {
  const { activeCell, selectCell } = useCellSelection();
  const isActive = activeCell !== null && activeCell.row === row;

  return (
    <div
      role="rowheader"
      aria-label={`Row ${row + 1}`}
      className={`relative flex cursor-pointer items-center justify-end border-b border-r border-border-subtle bg-surface-2 px-2 font-mono text-xs text-text-secondary transition-colors hover:bg-surface-3 ${
        isActive ? "bg-primary/20 text-primary" : ""
      }`}
      style={{ minWidth: HEADER_WIDTH, width: HEADER_WIDTH, height }}
      onClick={() => selectCell(row, 0)}
    >
      {row + 1}
      {onResizeStart && (
        <div
          className={`absolute bottom-0 left-0 w-full cursor-row-resize transition-colors ${
            isResizing ? "h-0.5 bg-primary" : "h-1 bg-transparent hover:bg-primary/30"
          }`}
          style={{ zIndex: 5 }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(row, e.clientY);
          }}
        />
      )}
    </div>
  );
}
