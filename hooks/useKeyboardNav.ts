"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { toCellId, parseCellId } from "@/lib/spreadsheet/cellAddress";

const ROWS = 100;
const COLS = 26;

interface UseKeyboardNavOptions {
  updatedBy: string;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

interface HistoryState {
  sheet: ReturnType<typeof useSpreadsheetStore.getState>["sheet"];
  activeCell: ReturnType<typeof useSelectionStore.getState>["activeCell"];
}

export function useKeyboardNav({ updatedBy, onEditStart, onEditEnd }: UseKeyboardNavOptions) {
  const { activeCell, selectionRange, setActiveCell, setSelectionRange } = useSelectionStore();
  const { sheet, setCellValue } = useSpreadsheetStore();
  
  const historyRef = useRef<HistoryState[]>([]);
  const historyIndexRef = useRef(-1);
  const isEditingRef = useRef(false);
  const copiedCellsRef = useRef<string>("");

  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      sheet: { ...sheet },
      activeCell: activeCell ? { ...activeCell } : null,
    };
    
    // Remove any future history if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }
    
    historyRef.current.push(currentState);
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, [sheet, activeCell]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const prevState = historyRef.current[historyIndexRef.current];
      if (prevState) {
        // Restore sheet state
        for (const [id, data] of Object.entries(prevState.sheet)) {
          setCellValue(id, data.raw, updatedBy, data.formatting);
        }
        if (prevState.activeCell) {
          setActiveCell(prevState.activeCell);
        }
      }
    }
  }, [setCellValue, setActiveCell, updatedBy]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      if (nextState) {
        for (const [id, data] of Object.entries(nextState.sheet)) {
          setCellValue(id, data.raw, updatedBy, data.formatting);
        }
        if (nextState.activeCell) {
          setActiveCell(nextState.activeCell);
        }
      }
    }
  }, [setCellValue, setActiveCell, updatedBy]);

  // Move selection
  const moveSelection = useCallback((deltaRow: number, deltaCol: number, extend: boolean = false) => {
    if (!activeCell) return;
    
    const newRow = Math.max(0, Math.min(ROWS - 1, activeCell.row + deltaRow));
    const newCol = Math.max(0, Math.min(COLS - 1, activeCell.col + deltaCol));
    
    if (extend && selectionRange) {
      setSelectionRange(selectionRange.start, { row: newRow, col: newCol });
    } else {
      setActiveCell({ row: newRow, col: newCol });
    }
  }, [activeCell, selectionRange, setActiveCell, setSelectionRange]);

  // Copy
  const copy = useCallback(async () => {
    if (!activeCell) return;
    
    const cells: string[] = [];
    if (selectionRange) {
      const { start, end } = selectionRange;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      
      for (let r = minRow; r <= maxRow; r++) {
        const rowCells: string[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          const cellId = toCellId({ row: r, col: c });
          const cell = sheet[cellId];
          rowCells.push(String(cell?.computed ?? cell?.raw ?? ""));
        }
        cells.push(rowCells.join("\t"));
      }
    } else {
      const cellId = toCellId(activeCell);
      const cell = sheet[cellId];
      cells.push(String(cell?.computed ?? cell?.raw ?? ""));
    }
    
    copiedCellsRef.current = cells.join("\n");
    
    try {
      await navigator.clipboard.writeText(copiedCellsRef.current);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [activeCell, selectionRange, sheet]);

  // Paste
  const paste = useCallback(async () => {
    if (!activeCell) return;
    
    saveToHistory();
    
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
  }, [activeCell, saveToHistory, setCellValue, updatedBy]);

  // Clear cell
  const clearCell = useCallback(() => {
    if (!activeCell) return;
    
    saveToHistory();
    
    if (selectionRange) {
      const { start, end } = selectionRange;
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const cellId = toCellId({ row: r, col: c });
          setCellValue(cellId, "", updatedBy);
        }
      }
    } else {
      const cellId = toCellId(activeCell);
      setCellValue(cellId, "", updatedBy);
    }
  }, [activeCell, selectionRange, saveToHistory, setCellValue, updatedBy]);

  // Toggle formatting
  const toggleBold = useCallback(() => {
    if (!activeCell) return;
    
    const cellId = toCellId(activeCell);
    const cell = sheet[cellId];
    setCellValue(cellId, cell?.raw ?? "", updatedBy, {
      ...cell?.formatting,
      bold: !cell?.formatting?.bold,
    });
  }, [activeCell, sheet, setCellValue, updatedBy]);

  const toggleItalic = useCallback(() => {
    if (!activeCell) return;
    
    const cellId = toCellId(activeCell);
    const cell = sheet[cellId];
    setCellValue(cellId, cell?.raw ?? "", updatedBy, {
      ...cell?.formatting,
      italic: !cell?.formatting?.italic,
    });
  }, [activeCell, sheet, setCellValue, updatedBy]);

  // Jump to cell
  const jumpToCell = useCallback((cellId: string) => {
    try {
      const coord = parseCellId(cellId);
      setActiveCell(coord);
    } catch {
      // Invalid cell ID
    }
  }, [setActiveCell]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if we're in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isShift = e.shiftKey;
      const isCtrl = e.ctrlKey || e.metaKey;

      // Navigation
      if (!isCtrl) {
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            moveSelection(-1, 0, isShift);
            break;
          case "ArrowDown":
            e.preventDefault();
            moveSelection(1, 0, isShift);
            break;
          case "ArrowLeft":
            e.preventDefault();
            moveSelection(0, -1, isShift);
            break;
          case "ArrowRight":
            e.preventDefault();
            moveSelection(0, 1, isShift);
            break;
          case "Tab":
            e.preventDefault();
            if (isShift) {
              moveSelection(0, -1);
            } else {
              if (activeCell && activeCell.col === COLS - 1) {
                setActiveCell({ row: Math.min(ROWS - 1, activeCell.row + 1), col: 0 });
              } else {
                moveSelection(0, 1);
              }
            }
            break;
          case "Enter":
            e.preventDefault();
            if (isEditingRef.current) {
              isEditingRef.current = false;
              onEditEnd?.();
              moveSelection(1, 0);
            } else {
              isEditingRef.current = true;
              onEditStart?.();
            }
            break;
          case "Escape":
            if (isEditingRef.current) {
              isEditingRef.current = false;
              onEditEnd?.();
            }
            break;
          case "Delete":
          case "Backspace":
            e.preventDefault();
            clearCell();
            break;
          case "F2":
            e.preventDefault();
            isEditingRef.current = true;
            onEditStart?.();
            break;
        }
      }

      // Ctrl/Cmd shortcuts
      if (isCtrl) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            toggleBold();
            break;
          case "i":
            e.preventDefault();
            toggleItalic();
            break;
          case "z":
            e.preventDefault();
            if (isShift) {
              redo();
            } else {
              undo();
            }
            break;
          case "y":
            e.preventDefault();
            redo();
            break;
          case "c":
            e.preventDefault();
            copy();
            break;
          case "v":
            e.preventDefault();
            paste();
            break;
          case "x":
            e.preventDefault();
            copy();
            clearCell();
            break;
          case "home":
            e.preventDefault();
            setActiveCell({ row: 0, col: 0 });
            break;
          case "end":
            e.preventDefault();
            // Jump to last used cell
            let maxRow = 0, maxCol = 0;
            for (const cellId of Object.keys(sheet)) {
              try {
                const coord = parseCellId(cellId);
                maxRow = Math.max(maxRow, coord.row);
                maxCol = Math.max(maxCol, coord.col);
              } catch {
                // Skip
              }
            }
            setActiveCell({ row: maxRow, col: maxCol });
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    activeCell,
    moveSelection,
    setActiveCell,
    clearCell,
    toggleBold,
    toggleItalic,
    copy,
    paste,
    undo,
    redo,
    sheet,
    onEditStart,
    onEditEnd,
  ]);

  return {
    isEditing: isEditingRef.current,
    undo,
    redo,
    copy,
    paste,
    clearCell,
    toggleBold,
    toggleItalic,
    jumpToCell,
    moveSelection,
  };
}
