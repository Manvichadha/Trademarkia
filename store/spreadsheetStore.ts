import { create } from "zustand";
import type { SheetData, CellData, CellFormatting } from "@/lib/spreadsheet/types";
import { setCell } from "@/lib/spreadsheet/engine";

interface SpreadsheetStore {
  sheet: SheetData;
  setCellValue: (cellId: string, raw: string, updatedBy: string, formatting?: Partial<CellFormatting>) => void;
  setSheet: (sheet: SheetData) => void;
  getCell: (cellId: string) => CellData | undefined;
}

export const useSpreadsheetStore = create<SpreadsheetStore>((set, get) => ({
  sheet: {},
  setCellValue: (cellId, raw, updatedBy, formatting) => {
    const { sheet } = get();
    const next = setCell(sheet, cellId, raw, updatedBy, formatting);
    set({ sheet: next });
  },
  setSheet: (sheet) => set({ sheet }),
  getCell: (cellId) => get().sheet[cellId],
}));
