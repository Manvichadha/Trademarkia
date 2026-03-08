/**
 * Export utilities for spreadsheet data.
 * Supports CSV, XLSX, and JSON export formats.
 */

import type { SheetData } from "@/lib/spreadsheet/types";
import { parseCellId, expandRange, type CellRange } from "@/lib/spreadsheet/cellAddress";

/**
 * Convert sheet data to CSV format.
 */
export function toCSV(sheet: SheetData): string {
  if (Object.keys(sheet).length === 0) {
    return "";
  }

  // Find the bounds of the data
  let maxRow = 0;
  let maxCol = 0;

  for (const cellId of Object.keys(sheet)) {
    try {
      const coord = parseCellId(cellId);
      maxRow = Math.max(maxRow, coord.row);
      maxCol = Math.max(maxCol, coord.col);
    } catch {
      // Skip invalid cell IDs
    }
  }

  if (maxRow === 0 && maxCol === 0) {
    return "";
  }

  // Build CSV rows
  const rows: string[][] = [];

  for (let row = 0; row <= maxRow; row++) {
    const rowData: string[] = [];
    for (let col = 0; col <= maxCol; col++) {
      const cellId = `${colToLetter(col)}${row + 1}`;
      const cell = sheet[cellId];
      let value = cell?.computed ?? cell?.raw ?? "";
      
      // Convert to string and handle special cases
      if (typeof value === "boolean") {
        value = value ? "TRUE" : "FALSE";
      } else if (value === null || value === undefined) {
        value = "";
      } else {
        value = String(value);
      }

      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        value = `"${value.replace(/"/g, '""')}"`;
      }

      rowData.push(value);
    }
    rows.push(rowData);
  }

  return rows.map((row) => row.join(",")).join("\n");
}

/**
 * Convert sheet data to JSON format.
 */
export function toJSON(sheet: SheetData): string {
  const data: Record<string, unknown> = {};

  for (const [cellId, cell] of Object.entries(sheet)) {
    data[cellId] = {
      raw: cell.raw,
      computed: cell.computed,
      formula: cell.formula,
      formatting: cell.formatting,
    };
  }

  return JSON.stringify(data, null, 2);
}

/**
 * Convert sheet data to a simple array format for XLSX generation.
 */
export function toArray(sheet: SheetData): (string | number | boolean | null)[][] {
  if (Object.keys(sheet).length === 0) {
    return [];
  }

  // Find the bounds of the data
  let maxRow = 0;
  let maxCol = 0;

  for (const cellId of Object.keys(sheet)) {
    try {
      const coord = parseCellId(cellId);
      maxRow = Math.max(maxRow, coord.row);
      maxCol = Math.max(maxCol, coord.col);
    } catch {
      // Skip invalid cell IDs
    }
  }

  if (maxRow === 0 && maxCol === 0) {
    return [];
  }

  // Build array rows
  const rows: (string | number | boolean | null)[][] = [];

  for (let row = 0; row <= maxRow; row++) {
    const rowData: (string | number | boolean | null)[] = [];
    for (let col = 0; col <= maxCol; col++) {
      const cellId = `${colToLetter(col)}${row + 1}`;
      const cell = sheet[cellId];
      rowData.push(cell?.computed ?? cell?.raw ?? null);
    }
    rows.push(rowData);
  }

  return rows;
}

/**
 * Convert sheet data to an HTML table for clipboard copy.
 */
export function toHTMLTable(sheet: SheetData, range?: CellRange): string {
  let cells: string[];

  if (range) {
    cells = expandRange(range);
  } else {
    cells = Object.keys(sheet);
  }

  if (cells.length === 0) {
    return "";
  }

  // Find bounds
  let minRow = Infinity, maxRow = -Infinity;
  let minCol = Infinity, maxCol = -Infinity;

  for (const cellId of cells) {
    try {
      const coord = parseCellId(cellId);
      minRow = Math.min(minRow, coord.row);
      maxRow = Math.max(maxRow, coord.row);
      minCol = Math.min(minCol, coord.col);
      maxCol = Math.max(maxCol, coord.col);
    } catch {
      // Skip invalid
    }
  }

  if (!isFinite(minRow)) {
    return "";
  }

  // Build HTML table
  let html = '<table style="border-collapse: collapse;">';

  for (let row = minRow; row <= maxRow; row++) {
    html += "<tr>";
    for (let col = minCol; col <= maxCol; col++) {
      const cellId = `${colToLetter(col)}${row + 1}`;
      const cell = sheet[cellId];
      let value = cell?.computed ?? cell?.raw ?? "";
      
      if (typeof value === "boolean") {
        value = value ? "TRUE" : "FALSE";
      } else if (value === null || value === undefined) {
        value = "";
      } else {
        value = String(value);
      }

      const style = [
        "border: 1px solid #d1d5db;",
        "padding: 4px 8px;",
        cell?.formatting?.bold ? "font-weight: bold;" : "",
        cell?.formatting?.italic ? "font-style: italic;" : "",
        cell?.formatting?.color ? `color: ${cell.formatting.color};` : "",
        cell?.formatting?.bgColor ? `background-color: ${cell.formatting.bgColor};` : "",
        cell?.formatting?.align ? `text-align: ${cell.formatting.align};` : "",
      ].filter(Boolean).join(" ");

      html += `<td style="${style}">${escapeHtml(value)}</td>`;
    }
    html += "</tr>";
  }

  html += "</table>";
  return html;
}

/**
 * Convert column index to letter (0 = A, 1 = B, ..., 25 = Z, 26 = AA, etc.)
 */
function colToLetter(col: number): string {
  let letter = "";
  let c = col + 1;
  while (c > 0) {
    const remainder = (c - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    c = Math.floor((c - 1) / 26);
  }
  return letter;
}

/**
 * Escape HTML special characters.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Download a file to the user's computer.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export formats supported by the application.
 */
export type ExportFormat = "csv" | "json" | "xlsx";

/**
 * Export the sheet data in the specified format.
 */
export function exportSheet(
  sheet: SheetData,
  format: ExportFormat,
  filename: string = "spreadsheet"
): void {
  switch (format) {
    case "csv":
      downloadFile(toCSV(sheet), `${filename}.csv`, "text/csv");
      break;
    case "json":
      downloadFile(toJSON(sheet), `${filename}.json`, "application/json");
      break;
    case "xlsx":
      // For XLSX, we'll generate a simple XML-based format
      // In production, you'd want to use a library like xlsx
      const htmlTable = toHTMLTable(sheet);
      const xlsxContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Sheet1">
    <Table>
${convertHTMLToXMLTable(htmlTable)}
    </Table>
  </Worksheet>
</Workbook>`;
      downloadFile(xlsxContent, `${filename}.xls`, "application/vnd.ms-excel");
      break;
  }
}

/**
 * Convert HTML table to Excel XML format.
 */
function convertHTMLToXMLTable(htmlTable: string): string {
  // Simple conversion - just strip HTML and format as XML
  // In production, use a proper XLSX library
  const rows = htmlTable.match(/<tr>([\s\S]*?)<\/tr>/gi) || [];
  let xml = "";
  
  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
    xml += "      <Row>\n";
    for (const cell of cells) {
      const content = cell.replace(/<td[^>]*>/i, "").replace(/<\/td>/i, "");
      xml += `        <Cell><Data ss:Type="String">${escapeXml(content)}</Data></Cell>\n`;
    }
    xml += "      </Row>\n";
  }
  
  return xml;
}

/**
 * Escape XML special characters.
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
