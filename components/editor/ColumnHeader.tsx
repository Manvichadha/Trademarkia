"use client";

import { useCallback } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { useCellSelection } from "@/hooks/useCellSelection";

const ROW_HEIGHT = 28;
const DEFAULT_COL_WIDTH = 100;

interface ColumnHeaderProps {
  col: number;
  width?: number;
  onResizeStart?: (col: number, startX: number) => void;
  isResizing?: boolean;
}

export function ColumnHeader({ col, width = DEFAULT_COL_WIDTH, onResizeStart, isResizing }: ColumnHeaderProps) {
  const { activeCell, selectRange } = useCellSelection();
  const label = toCellId({ row: 0, col }).replace(/\d+/, "");
  const isActive = activeCell !== null && activeCell.col === col;

  const handleClick = () => {
    // Select entire column when clicking column header
    if (activeCell) {
      selectRange(activeCell.row, activeCell.col, 99, col); // ROWS - 1 = 99
    } else {
      selectRange(0, 0, 99, col);
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (onResizeStart && e.target === e.currentTarget) {
      // Check if we're near the right edge (resize zone)
      const rect = e.currentTarget.getBoundingClientRect();
      const isNearEdge = e.clientX > rect.right - 8;
      
      if (isNearEdge) {
        e.preventDefault();
        e.stopPropagation();
        onResizeStart(col, e.clientX);
      }
    }
  }, [col, onResizeStart]);

  return (
    <div
      role="columnheader"
      aria-label={`Column ${label}`}
      className={`relative flex h-full cursor-pointer items-center justify-center border-b border-r border-border-subtle bg-surface-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-3 ${
        isActive ? "bg-primary/20 text-primary" : ""
      }`}
      style={{ minWidth: width, maxWidth: width, minHeight: ROW_HEIGHT }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {label}
      {onResizeStart && (
        <div
          className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize transition-colors ${
            isResizing ? "bg-primary" : "bg-transparent hover:bg-primary/30"
          }`}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResizeStart(col, e.clientX);
          }}
        />
      )}
    </div>
  );
}
