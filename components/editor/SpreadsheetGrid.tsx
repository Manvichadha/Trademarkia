"use client";

import { useState, useCallback, useRef } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { Cell } from "./Cell";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { useCellSelection } from "@/hooks/useCellSelection";
import { useResize } from "@/hooks/useResize";

const ROWS = 100;
const COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 48;

interface SpreadsheetGridProps {
  updatedBy: string;
  onColumnResize?: (col: number, width: number) => void;
}

const COL_LABELS = Array.from({ length: COLS }, (_, i) =>
  toCellId({ row: 0, col: i }).replace(/\d+/, "")
);

export function SpreadsheetGrid({ updatedBy, onColumnResize }: SpreadsheetGridProps) {
  const { selectCell, selectRange } = useCellSelection();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    getColumnWidth,
    startColumnResize,
    resizingColumn,
    isResizing,
  } = useResize({
    defaultWidth: DEFAULT_COL_WIDTH,
    defaultHeight: DEFAULT_ROW_HEIGHT,
    onColumnResize,
  });

  const handleCellMouseDown = useCallback((row: number, col: number, e: React.MouseEvent) => {
    if (e.button === 0 && !isResizing) { // Left click only, not during resize
      setIsDragging(true);
      dragStartRef.current = { row, col };
      selectCell(row, col);
    }
  }, [selectCell, isResizing]);

  const handleCellMouseEnter = useCallback((row: number, col: number) => {
    if (isDragging && dragStartRef.current) {
      selectRange(
        dragStartRef.current.row,
        dragStartRef.current.col,
        row,
        col
      );
    }
  }, [isDragging, selectRange]);

  // Global mouse up handler
  const handleGridMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
    }
  }, [isDragging]);

  return (
    <div 
      ref={gridRef}
      className="flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface-1 select-none"
      style={{ height: "calc(100vh - 180px)", minHeight: "400px" }}
      onMouseUp={handleGridMouseUp}
      onMouseLeave={handleGridMouseUp}
    >
      {/* Column headers */}
      <div className="flex shrink-0">
        <div
          className="border-b border-r border-border-subtle bg-surface-2"
          style={{ width: HEADER_WIDTH, height: DEFAULT_ROW_HEIGHT }}
        />
        <div className="flex">
          {COL_LABELS.map((_, col) => (
            <ColumnHeader 
              key={col} 
              col={col} 
              width={getColumnWidth(col)}
              onResizeStart={startColumnResize}
              isResizing={resizingColumn === col}
            />
          ))}
        </div>
      </div>

      {/* Rows - scrollable container */}
      <div className="relative flex-1 overflow-auto">
        {/* Row headers and cells */}
        <div className="flex flex-col">
          {Array.from({ length: ROWS }, (_, row) => (
            <div key={row} className="flex" style={{ height: DEFAULT_ROW_HEIGHT }}>
              <RowHeader row={row} height={DEFAULT_ROW_HEIGHT} />
              <div className="flex">
                {Array.from({ length: COLS }, (_, col) => (
                  <Cell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    updatedBy={updatedBy}
                    onCellMouseDown={handleCellMouseDown}
                    onCellMouseEnter={handleCellMouseEnter}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
