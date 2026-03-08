"use client";

import { useCallback } from "react";
import { ContextMenu } from "@/components/ui/ContextMenu";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { toCellId, parseCellId } from "@/lib/spreadsheet/cellAddress";
import type { ReactNode } from "react";

interface CellContextMenuProps {
  children: ReactNode;
  updatedBy: string;
  onInsertRowAbove?: () => void;
  onInsertRowBelow?: () => void;
  onDeleteRow?: () => void;
}

export function CellContextMenu({
  children,
  updatedBy,
  onInsertRowAbove,
  onInsertRowBelow,
  onDeleteRow,
}: CellContextMenuProps) {
  const { activeCell, selectionRange } = useSelectionStore();
  const { sheet, setCellValue } = useSpreadsheetStore();

  const getSelectedCells = useCallback(() => {
    if (!selectionRange && !activeCell) return [];
    if (selectionRange) {
      const { start, end } = selectionRange;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      
      const cells = [];
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          cells.push({ row: r, col: c });
        }
      }
      return cells;
    }
    return activeCell ? [activeCell] : [];
  }, [selectionRange, activeCell]);

  const handleCopy = useCallback(async () => {
    const cells = getSelectedCells();
    if (cells.length === 0) return;

    const textData: string[][] = [];
    let minRow = Infinity, maxRow = -Infinity;
    let minCol = Infinity, maxCol = -Infinity;

    for (const coord of cells) {
      minRow = Math.min(minRow, coord.row);
      maxRow = Math.max(maxRow, coord.row);
      minCol = Math.min(minCol, coord.col);
      maxCol = Math.max(maxCol, coord.col);
    }

    for (let r = minRow; r <= maxRow; r++) {
      const rowData: string[] = [];
      for (let c = minCol; c <= maxCol; c++) {
        const cellId = toCellId({ row: r, col: c });
        const cell = sheet[cellId];
        const value = cell?.computed ?? cell?.raw ?? "";
        rowData.push(String(value));
      }
      textData.push(rowData);
    }

    const text = textData.map(row => row.join("\t")).join("\n");
    
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [getSelectedCells, sheet]);

  const handleCut = useCallback(async () => {
    await handleCopy();
    const cells = getSelectedCells();
    for (const coord of cells) {
      const id = toCellId(coord);
      setCellValue(id, "", updatedBy);
    }
  }, [handleCopy, getSelectedCells, setCellValue, updatedBy]);

  const handlePaste = useCallback(async () => {
    if (!activeCell) return;
    
    try {
      const text = await navigator.clipboard.readText();
      const rows = text.split("\n").map(row => row.split("\t"));
      
      for (let r = 0; r < rows.length; r++) {
        const rowData = rows[r];
        if (!rowData) continue;
        
        for (let c = 0; c < rowData.length; c++) {
          const value = rowData[c];
          if (value === undefined) continue;
          
          const cellId = toCellId({ row: activeCell.row + r, col: activeCell.col + c });
          setCellValue(cellId, value, updatedBy);
        }
      }
    } catch (err) {
      console.error("Failed to paste:", err);
    }
  }, [activeCell, setCellValue, updatedBy]);

  const handleClearCells = useCallback(() => {
    const cells = getSelectedCells();
    for (const coord of cells) {
      const id = toCellId(coord);
      setCellValue(id, "", updatedBy);
    }
  }, [getSelectedCells, setCellValue, updatedBy]);

  const handleClearFormatting = useCallback(() => {
    const cells = getSelectedCells();
    for (const coord of cells) {
      const id = toCellId(coord);
      const cell = sheet[id];
      if (cell) {
        setCellValue(id, cell.raw, updatedBy, {});
      }
    }
  }, [getSelectedCells, sheet, setCellValue, updatedBy]);

  const handleInsertRowAbove = useCallback(() => {
    onInsertRowAbove?.();
  }, [onInsertRowAbove]);

  const handleInsertRowBelow = useCallback(() => {
    onInsertRowBelow?.();
  }, [onInsertRowBelow]);

  const handleDeleteRow = useCallback(() => {
    onDeleteRow?.();
  }, [onDeleteRow]);

  const items = [
    { label: "Copy", onClick: handleCopy, icon: "📋" },
    { label: "Cut", onClick: handleCut, icon: "✂️" },
    { label: "Paste", onClick: handlePaste, icon: "📄" },
    { label: "Clear Cells", onClick: handleClearCells, divider: true },
    { label: "Clear Formatting", onClick: handleClearFormatting },
    { label: "Insert Row Above", onClick: handleInsertRowAbove, divider: true },
    { label: "Insert Row Below", onClick: handleInsertRowBelow },
    { label: "Delete Row", onClick: handleDeleteRow },
  ];

  return <ContextMenu items={items}>{children}</ContextMenu>;
}
