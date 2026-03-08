import { create } from "zustand";
import type { SheetData, CellData, CellFormatting } from "@/lib/spreadsheet/types";
import { setCell } from "@/lib/spreadsheet/engine";

interface SpreadsheetStore {
  sheet: SheetData;
  frozenRows: number;
  frozenCols: number;
  setCellValue: (cellId: string, raw: string, updatedBy: string, formatting?: Partial<CellFormatting>) => void;
  setSheet: (sheet: SheetData) => void;
  setFrozenRows: (count: number) => void;
  setFrozenCols: (count: number) => void;
  getCell: (cellId: string) => CellData | undefined;
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  sheet: {},
  frozenRows: 0,
  frozenCols: 0,
  setCellValue: (cellId, raw, updatedBy, formatting) => {
    const { sheet } = get();
    const next = setCell(sheet, cellId, raw, updatedBy, formatting);
    set({ sheet: next });
  },
  setSheet: (sheet) => set({ sheet }),
  setFrozenRows: (count) => set({ frozenRows: count }),
  setFrozenCols: (count) => set({ frozenCols: count }),
  getCell: (cellId) => get().sheet[cellId],
}));
