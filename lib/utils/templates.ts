import type { CellData, SheetData } from "@/lib/spreadsheet/types";
import { evaluateSheet } from "@/lib/spreadsheet/evaluator";

export interface TemplateData {
  title: string;
  cells: Record<string, CellData>;
  colWidths?: Record<number, number>;
}

// Helper to quickly build cell data
function cell(raw: string, bold = false): CellData {
  return {
    raw,
    formula: raw.startsWith("=") ? raw : null,
    computed: null, // We'll evaluate the whole sheet below
    formatting: bold ? { bold: true } : {},
    updatedAt: Date.now(),
    updatedBy: "system",
  };
}

function evaluateTemplate(template: TemplateData): TemplateData {
  // Turn the cells into a proper SheetData object, evaluate it, and re-assign the computed values
  const evaluatedCells = evaluateSheet(template.cells as SheetData);
  return {
    ...template,
    cells: evaluatedCells,
  };
}

export const BLANK_TEMPLATE: TemplateData = evaluateTemplate({
  title: "Untitled Spreadsheet",
  cells: {},
});

export const BUDGET_TEMPLATE: TemplateData = evaluateTemplate({
  title: "Monthly Budget",
  colWidths: { 0: 200, 1: 150, 2: 150, 3: 200 },
  cells: {
    "A1": cell("Category", true),
    "B1": cell("Expected", true),
    "C1": cell("Actual", true),
    "D1": cell("Difference", true),

    "A2": cell("Housing"),
    "B2": cell("1500"),
    "C2": cell("1500"),
    "D2": cell("=B2-C2"),

    "A3": cell("Groceries"),
    "B3": cell("400"),
    "C3": cell("450"),
    "D3": cell("=B3-C3"),

    "A4": cell("Transportation"),
    "B4": cell("200"),
    "C4": cell("150"),
    "D4": cell("=B4-C4"),

    "A5": cell("Utilities"),
    "B5": cell("150"),
    "C5": cell("165"),
    "D5": cell("=B5-C5"),

    "A6": cell("Entertainment"),
    "B6": cell("100"),
    "C6": cell("120"),
    "D6": cell("=B6-C6"),

    "A8": cell("TOTALS", true),
    "B8": cell("=SUM(B2:B6)", true),
    "C8": cell("=SUM(C2:C6)", true),
    "D8": cell("=SUM(D2:D6)", true),
  },
});

export const TRACKER_TEMPLATE: TemplateData = evaluateTemplate({
  title: "Project Tracker",
  colWidths: { 0: 250, 1: 150, 2: 120, 3: 150 },
  cells: {
    "A1": cell("Task Name", true),
    "B1": cell("Owner", true),
    "C1": cell("Status", true),
    "D1": cell("Due Date", true),

    "A2": cell("Finalize design mockups"),
    "B2": cell("Alex"),
    "C2": cell("Done"),
    "D2": cell("Oct 12"),

    "A3": cell("Implement auth flow"),
    "B3": cell("Sam"),
    "C3": cell("In Progress"),
    "D3": cell("Oct 15"),

    "A4": cell("Database schema review"),
    "B4": cell("Jordan"),
    "C4": cell("Blocked"),
    "D4": cell("Oct 16"),

    "A5": cell("Deploy to staging"),
    "B5": cell("Alex"),
    "C5": cell("Not Started"),
    "D5": cell("Oct 20"),
  },
});

export const INVOICE_TEMPLATE: TemplateData = evaluateTemplate({
  title: "Invoice #1042",
  colWidths: { 0: 250, 1: 100, 2: 120, 3: 150 },
  cells: {
    "A1": cell("INVOICE", true),
    "A2": cell("ACME Corp"),
    "A3": cell("123 Business Rd"),
    "A4": cell("City, State 12345"),

    "A7": cell("Description", true),
    "B7": cell("Qty", true),
    "C7": cell("Unit Price", true),
    "D7": cell("Total", true),

    "A8": cell("Web Design Services"),
    "B8": cell("40"),
    "C8": cell("85"),
    "D8": cell("=B8*C8"),

    "A9": cell("Hosting Setup setup"),
    "B9": cell("1"),
    "C9": cell("250"),
    "D9": cell("=B9*C9"),

    "A10": cell("Domain Registration"),
    "B10": cell("1"),
    "C10": cell("15"),
    "D10": cell("=B10*C10"),

    "C12": cell("Subtotal", true),
    "D12": cell("=SUM(D8:D10)"),

    "C13": cell("Tax (10%)", true),
    "D13": cell("=D12*0.1"),

    "C14": cell("TOTAL DUE", true),
    "D14": cell("=D12+D13", true),
  },
});

export const ROSTER_TEMPLATE: TemplateData = evaluateTemplate({
  title: "Team Roster",
  colWidths: { 0: 150, 1: 150, 2: 200, 3: 150 },
  cells: {
    "A1": cell("First Name", true),
    "B1": cell("Last Name", true),
    "C1": cell("Email", true),
    "D1": cell("Department", true),

    "A2": cell("Sarah"),
    "B2": cell("Connor"),
    "C2": cell("sarah@email.com"),
    "D2": cell("Security"),

    "A3": cell("John"),
    "B3": cell("Smith"),
    "C3": cell("john@email.com"),
    "D3": cell("Engineering"),

    "A4": cell("Jane"),
    "B4": cell("Doe"),
    "C4": cell("jane@email.com"),
    "D4": cell("Design"),
  },
});
