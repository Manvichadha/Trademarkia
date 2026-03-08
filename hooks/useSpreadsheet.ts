"use client";

import { useCallback } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import type { SheetData } from "@/lib/spreadsheet/types";

export function useSpreadsheet(updatedBy: string) {
  const { sheet, setCellValue, setSheet } = useSpreadsheetStore();

  const updateCell = useCallback(
    (cellId: string, raw: string, formatting?: Parameters<typeof setCellValue>[3]) => {
      setCellValue(cellId, raw, updatedBy, formatting);
    },
    [updatedBy, setCellValue]
  );

  const loadSheet = useCallback(
    (data: SheetData) => {
      setSheet(data);
    },
    [setSheet]
  );

  return {
    sheet,
    updateCell,
    loadSheet,
  };
}
