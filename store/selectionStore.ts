import { create } from "zustand";
import type { CellCoord } from "@/lib/spreadsheet/cellAddress";

interface SelectionStore {
  activeCell: CellCoord | null;
  selectionRange: { start: CellCoord; end: CellCoord } | null;
  setActiveCell: (coord: CellCoord | null) => void;
  setSelectionRange: (start: CellCoord, end: CellCoord) => void;
  clearSelection: () => void;
}

export const useSelectionStore = create<SelectionStore>((set) => ({
  activeCell: { row: 0, col: 0 },
  selectionRange: null,
  setActiveCell: (coord) =>
    set({
      activeCell: coord,
      selectionRange: coord ? { start: coord, end: coord } : null,
    }),
  setSelectionRange: (start, end) =>
    set({
      activeCell: start,
      selectionRange: { start, end },
    }),
  clearSelection: () =>
    set({ activeCell: null, selectionRange: null }),
}));
