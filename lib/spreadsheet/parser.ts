/**
 * Formula tokenizer and recursive-descent parser.
 * Supports: SUM, AVERAGE, COUNT, MAX, MIN, IF, arithmetic, cell refs, ranges.
 */

export type TokenType =
  | "NUMBER"
  | "STRING"
  | "CELL_REF"
  | "RANGE"
  | "FUNCTION"
  | "OPERATOR"
  | "LPAREN"
  | "RPAREN"
  | "COMMA"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string | number;
}

export type AstNode =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "cell_ref"; cellId: string }
  | { type: "range"; start: string; end: string }
  | { type: "binary"; op: string; left: AstNode; right: AstNode }
  | { type: "function"; name: string; args: AstNode[] };

const FUNCTION_NAMES = new Set([
  "SUM",
  "AVERAGE",
  "COUNT",
  "MAX",
  "MIN",
  "IF",
  "CONCATENATE",
  "TODAY",
  "NOW",
  "LEN",
  "TRIM",
  "UPPER",
  "LOWER",
  "PROPER",
  "LEFT",
  "RIGHT",
  "MID",
  "ROUND",
  "ABS",
  "SQRT",
  "POWER",
  "PI",
  "TRUE",
  "FALSE",
]);

const CELL_REF = /^[A-Z]{1,2}\d+$/i;
const RANGE_REF = /^[A-Z]{1,2}\d+:[A-Z]{1,2}\d+$/i;

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = formula.trim();

  while (i < s.length) {
    const rest = s.slice(i);

    // Whitespace
    const ws = rest.match(/^\s+/);
    if (ws) {
      i += ws[0].length;
      continue;
    }

    // Number
    const num = rest.match(/^\d+(\.\d+)?/);
    if (num) {
      tokens.push({ type: "NUMBER", value: parseFloat(num[0]) });
      i += num[0].length;
      continue;
    }

    // String (double-quoted)
    const str = rest.match(/^"([^"]*)"/);
    if (str) {
      tokens.push({ type: "STRING", value: str[1]! });
      i += str[0].length;
      continue;
    }

    // Range (A1:B5) - must come before cell ref
    const range = rest.match(/^[A-Z]{1,2}\d+:[A-Z]{1,2}\d+/i);
    if (range) {
      tokens.push({ type: "RANGE", value: range[0].toUpperCase() });
      i += range[0].length;
      continue;
    }

    // Cell ref
    const cell = rest.match(/^[A-Z]{1,2}\d+/i);
    if (cell) {
      tokens.push({ type: "CELL_REF", value: cell[0].toUpperCase() });
      i += cell[0].length;
      continue;
    }

    // Function name (identifier before LPAREN)
    const ident = rest.match(/^[A-Z][A-Z0-9]*/i);
    if (ident && FUNCTION_NAMES.has(ident[0].toUpperCase())) {
      tokens.push({ type: "FUNCTION", value: ident[0].toUpperCase() });
      i += ident[0].length;
      continue;
    }

    // Operators and punctuation
    if (rest.startsWith("(")) {
      tokens.push({ type: "LPAREN", value: "(" });
      i += 1;
      continue;
    }
    if (rest.startsWith(")")) {
      tokens.push({ type: "RPAREN", value: ")" });
      i += 1;
      continue;
    }
    if (rest.startsWith(",")) {
      tokens.push({ type: "COMMA", value: "," });
      i += 1;
      continue;
    }
    if (rest.startsWith("+")) {
      tokens.push({ type: "OPERATOR", value: "+" });
      i += 1;
      continue;
    }
    if (rest.startsWith("-")) {
      tokens.push({ type: "OPERATOR", value: "-" });
      i += 1;
      continue;
    }
    if (rest.startsWith("*")) {
      tokens.push({ type: "OPERATOR", value: "*" });
      i += 1;
      continue;
    }
    if (rest.startsWith("/")) {
      tokens.push({ type: "OPERATOR", value: "/" });
      i += 1;
      continue;
    }
    if (rest.startsWith(">")) {
      tokens.push({ type: "OPERATOR", value: ">" });
      i += 1;
      continue;
    }
    if (rest.startsWith("<")) {
      tokens.push({ type: "OPERATOR", value: "<" });
      i += 1;
      continue;
    }
    if (rest.startsWith("=") && i > 0) {
      tokens.push({ type: "OPERATOR", value: "=" });
      i += 1;
      continue;
    }

    // Skip leading = at start of formula
    if (rest.startsWith("=") && i === 0) {
      i += 1;
      continue;
    }

    throw new Error(`Unexpected character at position ${i}: ${rest[0]}`);
  }

  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

export class FormulaParser {
  private tokens: Token[] = [];
  private pos = 0;

  parse(formula: string): AstNode {
    const trimmed = formula.trim();
    if (!trimmed.startsWith("=")) {
      throw new Error("Formula must start with =");
    }
    this.tokens = tokenize(trimmed);
    this.pos = 0;
    const expr = this.parseExpression();
    this.expect("EOF");
    return expr;
  }

  private current(): Token {
    return this.tokens[this.pos] ?? { type: "EOF", value: "" };
  }

  private advance(): Token {
    const t = this.current();
    if (this.pos < this.tokens.length) this.pos++;
    return t;
  }

  private expect(type: TokenType): Token {
    const t = this.current();
    if (t.type !== type) {
      throw new Error(`Expected ${type}, got ${t.type}`);
    }
    return this.advance();
  }

  private parseExpression(): AstNode {
    return this.parseComparison();
  }

  private parseComparison(): AstNode {
    const left = this.parseAdditive();
    const t = this.current();
    if (
      t.type === "OPERATOR" &&
      (t.value === ">" || t.value === "<" || t.value === "=")
    ) {
      this.advance();
      const right = this.parseAdditive();
      return { type: "binary", op: t.value as string, left, right };
    }
    return left;
  }

  private parseAdditive(): AstNode {
    let left = this.parseMultiplicative();
    while (true) {
      const t = this.current();
      if (t.type === "OPERATOR" && (t.value === "+" || t.value === "-")) {
        this.advance();
        const right = this.parseMultiplicative();
        left = { type: "binary", op: t.value as string, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseMultiplicative(): AstNode {
    let left = this.parseUnary();
    while (true) {
      const t = this.current();
      if (t.type === "OPERATOR" && (t.value === "*" || t.value === "/")) {
        this.advance();
        const right = this.parseUnary();
        left = { type: "binary", op: t.value as string, left, right };
      } else {
        break;
      }
    }
    return left;
  }

  private parseUnary(): AstNode {
    const t = this.current();
    if (t.type === "OPERATOR" && t.value === "-") {
      this.advance();
      const operand = this.parseUnary();
      return { type: "binary", op: "*", left: { type: "number", value: -1 }, right: operand };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): AstNode {
    const t = this.current();

    if (t.type === "NUMBER") {
      this.advance();
      return { type: "number", value: t.value as number };
    }

    if (t.type === "STRING") {
      this.advance();
      return { type: "string", value: t.value as string };
    }

    if (t.type === "CELL_REF") {
      this.advance();
      return { type: "cell_ref", cellId: t.value as string };
    }

    if (t.type === "RANGE") {
      this.advance();
      const [start, end] = (t.value as string).split(":");
      return { type: "range", start: start!, end: end! };
    }

    if (t.type === "FUNCTION") {
      const name = t.value as string;
      this.advance();
      this.expect("LPAREN");
      const args: AstNode[] = [];
      while (this.current().type !== "RPAREN") {
        args.push(this.parseExpression());
        if (this.current().type === "COMMA") {
          this.advance();
        } else {
          break;
        }
      }
      this.expect("RPAREN");
      return { type: "function", name, args };
    }

    if (t.type === "LPAREN") {
      this.advance();
      const expr = this.parseExpression();
      this.expect("RPAREN");
      return expr;
    }

    throw new Error(`Unexpected token: ${t.type}`);
  }
}

/**
 * Parse a formula string into an AST. Throws on invalid input.
 */
export function parseFormula(formula: string): AstNode {
  const parser = new FormulaParser();
  return parser.parse(formula);
}

/**
 * Get token types for display (e.g. formula bar token badges).
 */
export function getFormulaTokens(formula: string): { type: TokenType; value: string | number }[] {
  const trimmed = formula.trim();
  if (!trimmed.startsWith("=")) {
    return [];
  }
  const tokens = tokenize(trimmed);
  return tokens.filter((t) => t.type !== "EOF");
}
