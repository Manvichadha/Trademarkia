"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const MIN_WIDTH = 40;
const MAX_WIDTH = 600;
const MIN_HEIGHT = 20;
const MAX_HEIGHT = 100;

interface ColumnWidths {
  [col: number]: number;
}

interface RowHeights {
  [row: number]: number;
}

interface UseResizeOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  onColumnResize?: (col: number, width: number) => void;
  onRowResize?: (row: number, height: number) => void;
}

interface UseResizeReturn {
  columnWidths: ColumnWidths;
  rowHeights: RowHeights;
  resizingColumn: number | null;
  resizingRow: number | null;
  getColumnWidth: (col: number) => number;
  getRowHeight: (row: number) => number;
  startColumnResize: (col: number, startX: number) => void;
  startRowResize: (row: number, startY: number) => void;
  isResizing: boolean;
}

export function useResize({
  defaultWidth = 100,
  defaultHeight = 28,
  onColumnResize,
  onRowResize,
}: UseResizeOptions = {}): UseResizeReturn {
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({});
  const [rowHeights, setRowHeights] = useState<RowHeights>({});
  const [resizingColumn, setResizingColumn] = useState<number | null>(null);
  const [resizingRow, setResizingRow] = useState<number | null>(null);
  
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);

  const getColumnWidth = useCallback(
    (col: number) => columnWidths[col] ?? defaultWidth,
    [columnWidths, defaultWidth]
  );

  const getRowHeight = useCallback(
    (row: number) => rowHeights[row] ?? defaultHeight,
    [rowHeights, defaultHeight]
  );

  const startColumnResize = useCallback((col: number, startX: number) => {
    setResizingColumn(col);
    startXRef.current = startX;
    startWidthRef.current = getColumnWidth(col);
  }, [getColumnWidth]);

  const startRowResize = useCallback((row: number, startY: number) => {
    setResizingRow(row);
    startYRef.current = startY;
    startHeightRef.current = getRowHeight(row);
  }, [getRowHeight]);

  useEffect(() => {
    if (resizingColumn === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta));
      
      setColumnWidths((prev) => ({
        ...prev,
        [resizingColumn]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      if (resizingColumn !== null) {
        const width = getColumnWidth(resizingColumn);
        onColumnResize?.(resizingColumn, width);
      }
      setResizingColumn(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, getColumnWidth, onColumnResize]);

  useEffect(() => {
    if (resizingRow === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientY - startYRef.current;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeightRef.current + delta));
      
      setRowHeights((prev) => ({
        ...prev,
        [resizingRow]: newHeight,
      }));
    };

    const handleMouseUp = () => {
      if (resizingRow !== null) {
        const height = getRowHeight(resizingRow);
        onRowResize?.(resizingRow, height);
      }
      setResizingRow(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingRow, getRowHeight, onRowResize]);

  return {
    columnWidths,
    rowHeights,
    resizingColumn,
    resizingRow,
    getColumnWidth,
    getRowHeight,
    startColumnResize,
    startRowResize,
    isResizing: resizingColumn !== null || resizingRow !== null,
  };
}

interface ColumnResizeHandleProps {
  col: number;
  onResizeStart: (col: number, startX: number) => void;
  isResizing: boolean;
}

export function ColumnResizeHandle({
  col,
  onResizeStart,
  isResizing,
}: ColumnResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onResizeStart(col, e.clientX);
    },
    [col, onResizeStart]
  );

  return (
    <div
      className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors ${
        isResizing ? "bg-primary" : "bg-transparent hover:bg-primary/50"
      }`}
      style={{ transform: "translateX(50%)" }}
      onMouseDown={handleMouseDown}
    />
  );
}

interface RowResizeHandleProps {
  row: number;
  onResizeStart: (row: number, startY: number) => void;
  isResizing: boolean;
}

export function RowResizeHandle({
  row,
  onResizeStart,
  isResizing,
}: RowResizeHandleProps) {
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onResizeStart(row, e.clientY);
    },
    [row, onResizeStart]
  );

  return (
    <div
      className={`absolute bottom-0 left-0 w-full h-1 cursor-row-resize transition-colors ${
        isResizing ? "bg-primary" : "bg-transparent hover:bg-primary/50"
      }`}
      style={{ transform: "translateY(50%)" }}
      onMouseDown={handleMouseDown}
    />
  );
}
