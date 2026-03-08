/**
 * Convert between A1 notation and { row, col } coordinates.
 * Supports columns A–ZZ (702 columns). Row is 0-based.
 */

export interface CellCoord {
  row: number;
  col: number;
}

const COL_BASE = 26;

/**
 * Parse "A1" → { row: 0, col: 0 }
 * Parse "B3" → { row: 2, col: 1 }
 * Supports up to column ZZ (col 701).
 */
export function parseCellId(cellId: string): CellCoord {
  const match = cellId.match(/^([A-Z]{1,2})(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid cell id: ${cellId}`);
  }

  const colStr = match[1]!.toUpperCase();
  const rowStr = match[2]!;

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * COL_BASE + (colStr.charCodeAt(i)! - 64);
  }
  col -= 1; // A = 0

  const row = parseInt(rowStr, 10) - 1; // 1-based to 0-based

  if (row < 0 || col < 0 || col >= 702) {
    throw new Error(`Cell id out of range: ${cellId}`);
  }

  return { row, col };
}

/**
 * Convert { row: 0, col: 0 } → "A1"
 * Supports up to column ZZ.
 */
export function toCellId(coord: CellCoord): string {
  const { row, col } = coord;
  if (row < 0 || col < 0 || col >= 702) {
    throw new Error(`Coord out of range: row=${row}, col=${col}`);
  }

  let colStr = "";
  let c = col + 1; // 0-based to 1-based for column letter
  while (c > 0) {
    const remainder = (c - 1) % COL_BASE;
    colStr = String.fromCharCode(65 + remainder) + colStr;
    c = Math.floor((c - 1) / COL_BASE);
  }

  return `${colStr}${row + 1}`;
}

/**
 * Parse a range like "A1:B5" into { start: {row, col}, end: {row, col} }.
 */
export interface CellRange {
  start: CellCoord;
  end: CellCoord;
}

export function parseRange(rangeStr: string): CellRange {
  const parts = rangeStr.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid range: ${rangeStr}`);
  }
  const start = parseCellId(parts[0]!.trim());
  const end = parseCellId(parts[1]!.trim());
  return { start, end };
}

/**
 * Expand a range to an array of cell ids.
 */
export function expandRange(range: CellRange): string[] {
  const ids: string[] = [];
  const minRow = Math.min(range.start.row, range.end.row);
  const maxRow = Math.max(range.start.row, range.end.row);
  const minCol = Math.min(range.start.col, range.end.col);
  const maxCol = Math.max(range.start.col, range.end.col);

  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      ids.push(toCellId({ row: r, col: c }));
    }
  }
  return ids;
}
