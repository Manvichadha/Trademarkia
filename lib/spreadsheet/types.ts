export type CellValue = string | number | boolean | null;

export type CellId = string; // "A1", "B3", etc.

export interface CellFormatting {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
}

export interface CellData {
  raw: string;
  computed: CellValue;
  formula: string | null;
  formatting: CellFormatting;
  updatedAt: number;
  updatedBy: string;
}

export interface SheetData {
  [cellId: CellId]: CellData;
}
