/**
 * Formula evaluator with dependency graph, circular reference detection,
 * and standard error types: #CIRC!, #REF!, #DIV/0!, #NAME?, #VALUE!
 */

import { parseFormula } from "./parser";
import type { AstNode } from "./parser";
import type { CellValue, SheetData } from "./types";
import { expandRange, parseRange } from "./cellAddress";

export const ERROR_CIRC = "#CIRC!";
export const ERROR_REF = "#REF!";
export const ERROR_DIV = "#DIV/0!";
export const ERROR_NAME = "#NAME?";
export const ERROR_VALUE = "#VALUE!";

export function isError(value: CellValue): value is string {
  return (
    typeof value === "string" &&
    (value === ERROR_CIRC ||
      value === ERROR_REF ||
      value === ERROR_DIV ||
      value === ERROR_NAME ||
      value === ERROR_VALUE)
  );
}

function isErrorResult(v: EvalResult): v is string {
  return typeof v === "string" && isError(v);
}

function toNumber(v: CellValue): number | null {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? null : n;
  }
  if (typeof v === "boolean") return v ? 1 : 0;
  return null;
}

function getCellValue(sheet: SheetData, cellId: string): CellValue {
  const cell = sheet[cellId];
  if (!cell) return null;
  return cell.computed;
}

function collectDependencies(node: AstNode, deps: Set<string>): void {
  switch (node.type) {
    case "cell_ref":
      deps.add(node.cellId);
      break;
    case "range":
      try {
        const range = parseRange(`${node.start}:${node.end}`);
        for (const id of expandRange(range)) {
          deps.add(id);
        }
      } catch {
        // invalid range, skip
      }
      break;
    case "binary":
      collectDependencies(node.left, deps);
      collectDependencies(node.right, deps);
      break;
    case "function":
      for (const arg of node.args) {
        collectDependencies(arg, deps);
      }
      break;
    default:
      break;
  }
}

/**
 * Build dependency graph: for each cell, which cells it depends on.
 */
export function buildDependencyGraph(sheet: SheetData): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  for (const [cellId, data] of Object.entries(sheet)) {
    if (data.formula) {
      try {
        const ast = parseFormula(data.formula);
        const deps = new Set<string>();
        collectDependencies(ast, deps);
        graph.set(cellId, deps);
      } catch {
        graph.set(cellId, new Set());
      }
    }
  }
  return graph;
}

/**
 * Topological sort for evaluation order. Returns cell ids in dependency order.
 * Throws if circular dependency detected.
 */
export function topologicalSort(
  graph: Map<string, Set<string>>
): string[] {
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: string[] = [];
  const cycle: string[] = [];

  function visit(id: string): boolean {
    if (temp.has(id)) {
      cycle.push(id);
      return true; // cycle detected
    }
    if (visited.has(id)) return false;
    temp.add(id);
    const deps = graph.get(id);
    if (deps) {
      for (const dep of deps) {
        if (visit(dep)) {
          cycle.push(id);
          return true;
        }
      }
    }
    temp.delete(id);
    visited.add(id);
    result.push(id);
    return false;
  }

  for (const id of graph.keys()) {
    if (!visited.has(id)) {
      if (visit(id)) {
        throw new Error(`Circular reference: ${cycle.reverse().join(" -> ")}`);
      }
    }
  }

  return result;
}

/** Internal: evaluator may return number[] for range nodes (consumed by functions). */
type EvalResult = CellValue | number[];

/**
 * Evaluate a single formula AST against the current sheet state.
 */
export function evaluateNode(
  node: AstNode,
  sheet: SheetData,
  currentCellId: string,
  visited: Set<string>
): EvalResult {
  if (visited.has(currentCellId)) {
    return ERROR_CIRC;
  }

  switch (node.type) {
    case "number":
      return node.value;

    case "string":
      return node.value;

    case "cell_ref": {
      const val = getCellValue(sheet, node.cellId);
      if (val === undefined) return null;
      if (isError(val)) return val;
      return val;
    }

    case "range": {
      try {
        const range = parseRange(`${node.start}:${node.end}`);
        const ids = expandRange(range);
        const values: number[] = [];
        for (const id of ids) {
          const v = getCellValue(sheet, id);
          const n = toNumber(v);
          if (n !== null) values.push(n);
        }
        return values; // Return as array for aggregate functions
      } catch {
        return ERROR_REF;
      }
    }

    case "binary": {
      const left = evaluateNode(node.left, sheet, currentCellId, visited);
      const right = evaluateNode(node.right, sheet, currentCellId, visited);

      if (isErrorResult(left) || isErrorResult(right)) {
        return isErrorResult(left) ? left : right;
      }

      const ln = toNumber(left as CellValue);
      const rn = toNumber(right as CellValue);

      if (node.op === "+" || node.op === "-" || node.op === "*" || node.op === "/") {
        if (ln === null || rn === null) return ERROR_VALUE;
        if (node.op === "/" && rn === 0) return ERROR_DIV;
        switch (node.op) {
          case "+":
            return ln + rn;
          case "-":
            return ln - rn;
          case "*":
            return ln * rn;
          case "/":
            return ln / rn;
        }
      }

      if (node.op === ">" || node.op === "<" || node.op === "=") {
        if (ln !== null && rn !== null) {
          switch (node.op) {
            case ">":
              return ln > rn;
            case "<":
              return ln < rn;
            case "=":
              return ln === rn;
          }
        }
        return ERROR_VALUE;
      }

      return ERROR_VALUE;
    }

    case "function": {
      const args = node.args.map((a) =>
        evaluateNode(a, sheet, currentCellId, visited)
      );

      if (args.some(isErrorResult)) {
        return args.find(isErrorResult)!;
      }

      const gatherNumbers = (): number[] => {
        const nums: number[] = [];
        for (const a of args) {
          if (Array.isArray(a)) {
            nums.push(...(a as number[]));
          } else {
            const n = toNumber(a);
            if (n !== null) nums.push(n);
          }
        }
        return nums;
      };

      switch (node.name) {
        case "SUM": {
          const nums = gatherNumbers();
          return nums.reduce((s, n) => s + n, 0);
        }
        case "AVERAGE": {
          const nums = gatherNumbers();
          if (nums.length === 0) return ERROR_DIV;
          return nums.reduce((s, n) => s + n, 0) / nums.length;
        }
        case "COUNT": {
          const nums = gatherNumbers();
          return nums.length;
        }
        case "MAX": {
          const nums = gatherNumbers();
          if (nums.length === 0) return 0;
          return Math.max(...nums);
        }
        case "MIN": {
          const nums = gatherNumbers();
          if (nums.length === 0) return 0;
          return Math.min(...nums);
        }
        case "IF": {
          if (args.length !== 3) return ERROR_VALUE;
          const cond = args[0];
          const tVal = args[1] as CellValue;
          const fVal = args[2] as CellValue;
          if (Array.isArray(cond)) return ERROR_VALUE;
          const condBool =
            cond === true ||
            (typeof cond === "number" && cond !== 0) ||
            (typeof cond === "string" && cond.length > 0);
          return condBool ? tVal : fVal;
        }
        default:
          return ERROR_NAME;
      }
    }

    default:
      return ERROR_VALUE;
  }
}

/**
 * Evaluate the entire sheet, updating computed values.
 * Uses topological sort to respect dependencies. Sets #CIRC! for circular refs.
 */
export function evaluateSheet(sheet: SheetData): SheetData {
  const graph = buildDependencyGraph(sheet);
  const allCells = new Set<string>([
    ...Object.keys(sheet),
    ...Array.from(graph.values()).flatMap((s) => Array.from(s)),
  ]);

  // Add cells with no formula to graph so they get evaluated
  for (const id of allCells) {
    if (!graph.has(id)) {
      graph.set(id, new Set());
    }
  }

  let order: string[];
  try {
    order = topologicalSort(graph);
  } catch {
    // Circular ref: mark all formula cells in cycle as #CIRC!
    const result = { ...sheet };
    for (const [id, data] of Object.entries(result)) {
      if (data.formula) {
        result[id] = {
          ...data,
          computed: ERROR_CIRC,
        };
      }
    }
    return result;
  }

  const result: SheetData = {};
  const visited = new Set<string>();

  for (const cellId of order) {
    const data = sheet[cellId];
    if (!data) continue;

    if (data.formula) {
      try {
        const ast = parseFormula(data.formula);
        visited.add(cellId);
        const computed = evaluateNode(ast, result, cellId, visited);
        visited.delete(cellId);
        const cellValue: CellValue = Array.isArray(computed)
          ? ERROR_VALUE
          : (computed ?? null);
        result[cellId] = {
          ...data,
          computed: cellValue,
        };
      } catch {
        result[cellId] = {
          ...data,
          computed: ERROR_VALUE,
        };
      }
    } else {
      result[cellId] = { ...data };
    }
  }

  return result;
}
