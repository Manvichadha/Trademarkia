import { evaluateSheet } from "../lib/spreadsheet/evaluator";
import { BUDGET_TEMPLATE } from "../lib/utils/templates";

try {
  evaluateSheet(BUDGET_TEMPLATE.cells as any);
} catch (e) {
  console.error("Evaluation threw:", e);
}
