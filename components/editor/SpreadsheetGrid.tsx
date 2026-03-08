"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { Cell } from "./Cell";
import { ColumnHeader } from "./ColumnHeader";
import { RowHeader } from "./RowHeader";
import { DraggableColumnHeaders } from "./DraggableColumnHeaders";
import { useCellSelection } from "@/hooks/useCellSelection";
import { useResize } from "@/hooks/useResize";
import { useKeyboardNav } from "@/hooks/useKeyboardNav";
import { useSelectionStore } from "@/store/selectionStore";

const ROWS = 100;
const COLS = 26;
const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;
const HEADER_WIDTH = 48;

interface SpreadsheetGridProps {
  updatedBy: string;
  heatMap?: boolean;
  // Resize — can be provided externally (lifted state) or managed internally
  getColumnWidth?: (col: number) => number;
  getRowHeight?: (row: number) => number;
  startColumnResize?: (col: number, x: number) => void;
  startRowResize?: (row: number, y: number) => void;
  resizingColumn?: number | null;
  resizingRow?: number | null;
  onColumnResize?: (col: number, width: number) => void;
  onRowResize?: (row: number, height: number) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  presenceOverlay?: React.ReactNode;
}

const COL_LABELS = Array.from({ length: COLS }, (_, i) =>
  toCellId({ row: 0, col: i }).replace(/\d+/, "")
);
// COL_LABELS used as fallback reference - actual rendering done in DraggableColumnHeaders

export function SpreadsheetGrid({
  updatedBy,
  heatMap = false,
  getColumnWidth: extGetColumnWidth,
  getRowHeight: extGetRowHeight,
  startColumnResize: extStartColumnResize,
  startRowResize: extStartRowResize,
  resizingColumn: extResizingColumn,
  resizingRow: extResizingRow,
  onColumnResize,
  onRowResize,
  scrollRef: externalScrollRef,
  presenceOverlay,
}: SpreadsheetGridProps) {
  const { selectCell, selectRange } = useCellSelection();
  const { activeCell } = useSelectionStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ row: number; col: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Column order for drag-reorder (default: 0..25)
  const [colOrder, setColOrder] = useState<number[]>(() =>
    Array.from({ length: COLS }, (_, i) => i)
  );
  // Expose scroll ref to parent (for PresenceLayer positioning)
  useEffect(() => {
    if (externalScrollRef && scrollContainerRef.current) {
      (externalScrollRef as React.MutableRefObject<HTMLDivElement | null>).current =
        scrollContainerRef.current;
    }
  });
  // Track which cell is being edited inline
  const [editingCellId, setEditingCellId] = useState<string | null>(null);

  const {
    getColumnWidth: internalGetColumnWidth,
    getRowHeight: internalGetRowHeight,
    startColumnResize: internalStartColumnResize,
    startRowResize: internalStartRowResize,
    resizingColumn: internalResizingColumn,
    resizingRow: internalResizingRow,
    isResizing,
  } = useResize({
    defaultWidth: DEFAULT_COL_WIDTH,
    defaultHeight: DEFAULT_ROW_HEIGHT,
    onColumnResize,
    onRowResize,
  });

  // Prefer external (lifted) resize state over internal
  const getColumnWidth = extGetColumnWidth ?? internalGetColumnWidth;
  const getRowHeight = extGetRowHeight ?? internalGetRowHeight;
  const startColumnResize = extStartColumnResize ?? internalStartColumnResize;
  const startRowResize = extStartRowResize ?? internalStartRowResize;
  const resizingColumn = extResizingColumn !== undefined ? extResizingColumn : internalResizingColumn;
  const resizingRow = extResizingRow !== undefined ? extResizingRow : internalResizingRow;

  // Wire keyboard nav
  const { saveToHistory } = useKeyboardNav({
    updatedBy,
    onEditStart: (cellId) => setEditingCellId(cellId),
    onEditEnd: () => setEditingCellId(null),
  });

  // Scroll active cell into view
  useEffect(() => {
    if (!activeCell || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    // Calculate pixel offset of the active cell
    let colOffset = HEADER_WIDTH;
    for (let c = 0; c < activeCell.col; c++) colOffset += getColumnWidth(c);
    let rowOffset = DEFAULT_ROW_HEIGHT; // header row height
    for (let r = 0; r < activeCell.row; r++) rowOffset += getRowHeight(r);
    const cellWidth = getColumnWidth(activeCell.col);
    const cellHeight = getRowHeight(activeCell.row);

    const { scrollLeft, scrollTop, clientWidth, clientHeight } = container;
    if (colOffset < scrollLeft + HEADER_WIDTH) {
      container.scrollLeft = colOffset - HEADER_WIDTH;
    } else if (colOffset + cellWidth > scrollLeft + clientWidth) {
      container.scrollLeft = colOffset + cellWidth - clientWidth;
    }
    if (rowOffset < scrollTop + DEFAULT_ROW_HEIGHT) {
      container.scrollTop = rowOffset - DEFAULT_ROW_HEIGHT;
    } else if (rowOffset + cellHeight > scrollTop + clientHeight) {
      container.scrollTop = rowOffset + cellHeight - clientHeight;
    }
  }, [activeCell, getColumnWidth, getRowHeight]);

  const handleCellMouseDown = useCallback(
    (row: number, col: number, e: React.MouseEvent) => {
      if (e.button === 0 && !isResizing) {
        setIsDragging(true);
        dragStartRef.current = { row, col };
        selectCell(row, col);
        saveToHistory();
      }
    },
    [selectCell, isResizing, saveToHistory]
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isDragging && dragStartRef.current) {
        selectRange(dragStartRef.current.row, dragStartRef.current.col, row, col);
      }
    },
    [isDragging, selectRange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Total content width
  const totalWidth =
    HEADER_WIDTH +
    Array.from({ length: COLS }, (_, i) => getColumnWidth(i)).reduce((a, b) => a + b, 0);

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-lg border border-border-subtle bg-surface-1 select-none"
      style={{ height: "calc(100vh - 180px)", minHeight: "400px" }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Resize column drag-line */}
      {resizingColumn !== null && (
        <div
          className="pointer-events-none absolute inset-y-0 z-50 w-px bg-primary"
          style={{
            left:
              HEADER_WIDTH +
              Array.from({ length: resizingColumn + 1 }, (_, i) =>
                getColumnWidth(i)
              ).reduce((a, b) => a + b, 0),
          }}
        />
      )}

      {/* Resize row drag-line */}
      {resizingRow !== null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-50 h-px bg-primary"
          style={{
            top:
              DEFAULT_ROW_HEIGHT +
              Array.from({ length: resizingRow + 1 }, (_, i) =>
                getRowHeight(i)
              ).reduce((a, b) => a + b, 0),
          }}
        />
      )}

      {/* Single scrollable container */}
      <div
        ref={scrollContainerRef}
        className="relative flex-1 overflow-auto"
      >
        {/* Presence layer — overlays cells */}
        {presenceOverlay}
        <div
          className="flex flex-col"
          style={{ minWidth: totalWidth }}
        >
          {/* Sticky column header row with drag-to-reorder */}
          <div
            className="flex shrink-0 sticky top-0 z-20"
            style={{ height: DEFAULT_ROW_HEIGHT }}
          >
            {/* Top-left corner — sticks top AND left */}
            <div
              className="sticky left-0 z-30 shrink-0 border-b border-r border-border-subtle bg-surface-2"
              style={{ width: HEADER_WIDTH, height: DEFAULT_ROW_HEIGHT }}
            />
            <DraggableColumnHeaders
              colOrder={colOrder}
              onReorder={setColOrder}
              getColumnWidth={getColumnWidth}
              renderColumnHeader={(col) => (
                <ColumnHeader
                  key={col}
                  col={col}
                  width={getColumnWidth(col)}
                  onResizeStart={startColumnResize}
                  isResizing={resizingColumn === col}
                />
              )}
            />
          </div>

          {/* Data rows */}
          {Array.from({ length: ROWS }, (_, row) => {
            const rowH = getRowHeight(row);
            return (
              <div key={row} className="flex" style={{ height: rowH }}>
                {/* Sticky row header */}
                <div className="sticky left-0 z-10 shrink-0">
                  <RowHeader
                    row={row}
                    height={rowH}
                    onResizeStart={startRowResize}
                    isResizing={resizingRow === row}
                  />
                </div>
                {Array.from({ length: COLS }, (_, col) => (
                  <Cell
                    key={`${row}-${col}`}
                    row={row}
                    col={col}
                    width={getColumnWidth(col)}
                    height={rowH}
                    heatMap={heatMap}
                    updatedBy={updatedBy}
                    forceEdit={editingCellId === toCellId({ row, col })}
                    onEditDone={() => setEditingCellId(null)}
                    onCellMouseDown={handleCellMouseDown}
                    onCellMouseEnter={handleCellMouseEnter}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
