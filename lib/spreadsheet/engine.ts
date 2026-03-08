/**
 * Spreadsheet formula engine — ties parser and evaluator together.
 * Pure TypeScript, no UI dependencies.
 */

import type { CellData, CellFormatting, SheetData } from "./types";
import { parseFormula, getFormulaTokens } from "./parser";
import { evaluateSheet, isError } from "./evaluator";
import { toCellId, parseCellId } from "./cellAddress";

export type { CellValue, CellId, CellData, CellFormatting, SheetData } from "./types";
export { parseCellId, toCellId, parseRange, expandRange } from "./cellAddress";
export { parseFormula, getFormulaTokens } from "./parser";
export type { AstNode, Token, TokenType } from "./parser";
export { evaluateSheet, isError, ERROR_CIRC, ERROR_REF, ERROR_DIV, ERROR_NAME, ERROR_VALUE } from "./evaluator";

const DEFAULT_FORMATTING: CellFormatting = {};

/**
 * Create a new empty cell.
 */
export function createCell(
  raw: string,
  updatedBy: string,
  formatting?: Partial<CellFormatting>
): CellData {
  const now = Date.now();
  const formula = raw.trim().startsWith("=") ? raw.trim() : null;
  const computed = formula ? null : parseRawValue(raw);

  return {
    raw,
    computed,
    formula,
    formatting: { ...DEFAULT_FORMATTING, ...formatting },
    updatedAt: now,
    updatedBy,
  };
}

function parseRawValue(raw: string): string | number | boolean | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const num = parseFloat(trimmed);
  if (!Number.isNaN(num) && trimmed === String(num)) return num;
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  return trimmed;
}

/**
 * Update a cell in the sheet and re-evaluate.
 */
export function setCell(
  sheet: SheetData,
  cellId: string,
  raw: string,
  updatedBy: string,
  formatting?: Partial<CellFormatting>
): SheetData {
  const cell = createCell(raw, updatedBy, formatting);
  const next = { ...sheet, [cellId]: cell };
  return evaluateSheet(next);
}

/**
 * Get the display value for a cell (computed if formula, else raw).
 */
export function getDisplayValue(sheet: SheetData, cellId: string): string | number | boolean | null {
  const cell = sheet[cellId];
  if (!cell) return null;
  if (cell.formula) {
    const v = cell.computed;
    if (v === null || v === undefined) return "";
    return v;
  }
  return cell.computed ?? cell.raw;
}

/**
 * Check if a cell contains a formula.
 */
export function isFormulaCell(sheet: SheetData, cellId: string): boolean {
  const cell = sheet[cellId];
  return Boolean(cell?.formula);
}
