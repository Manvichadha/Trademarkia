# Formula Parser — Design & Justification

## Overview

The formula parser is a **recursive-descent parser** that tokenizes and parses spreadsheet formula strings into an Abstract Syntax Tree (AST). It supports arithmetic, cell references, ranges, and common functions (SUM, AVERAGE, COUNT, MAX, MIN, IF).

## Grammar (Informal)

```
formula     := "=" expression
expression  := comparison
comparison  := additive ((">" | "<" | "=") additive)*
additive    := multiplicative (("+" | "-") multiplicative)*
multiplicative := unary (("*" | "/") unary)*
unary       := "-" unary | primary
primary     := number | string | cell_ref | range | function_call | "(" expression ")"
function_call := FUNCTION "(" (expression ("," expression)*)? ")"
cell_ref    := [A-Z]{1,2} \d+
range       := cell_ref ":" cell_ref
```

## Why Recursive Descent (vs. a Library)

1. **No runtime dependency** — Parser is ~200 lines of pure TypeScript. No need for a heavy grammar engine (e.g. nearley, chevrotain) or code generation.
2. **Full control** — We can emit exactly the AST shape we need for the evaluator, with no impedance mismatch.
3. **Predictable behavior** — Operator precedence and associativity are explicit in the call structure. No grammar ambiguity.
4. **Easy to extend** — Adding a new function or operator is a small, localized change.
5. **Debuggable** — Stack traces point directly to our code. No black-box parser state.

## Supported Constructs

| Construct | Example |
|-----------|---------|
| Arithmetic | `=A1+B2`, `=A1*B2/C3`, `=A1+5*3-B2` |
| Cell reference | `=A1` |
| Range | `=SUM(A1:B5)` |
| SUM | `=SUM(A1:B5)`, `=SUM(A1,A2,A3)` |
| AVERAGE | `=AVERAGE(A1:A10)` |
| COUNT | `=COUNT(A1:A10)` |
| MAX / MIN | `=MAX(A1:A10)`, `=MIN(A1:A10)` |
| IF | `=IF(A1>10, "yes", "no")` |
| Comparison | `=A1>10`, `=B2<5`, `=C3=0` (inside expressions) |

## Known Limitations

1. **No `>=`, `<=`, `<>`** — Only `>`, `<`, `=` are supported. Can be added with small tokenizer/parser changes.
2. **No `&` string concatenation** — Not implemented.
3. **No nested ranges in some functions** — e.g. `SUM(A1:B2,C3:D4)` works (multiple args), but the parser handles it.
4. **IF condition** — Only a single comparison or numeric value. No `AND`/`OR` yet.
5. **Column limit** — Columns A–ZZ (702) as specified. Beyond that would need tokenizer changes.

## Edge Cases

- **Empty string** → Treated as null in raw values.
- **Invalid range** (e.g. `A1:B`) → Parser may throw or evaluator returns `#REF!`.
- **Circular reference** → Evaluator sets `#CIRC!` and topological sort detects the cycle.
- **Division by zero** → Returns `#DIV/0!`.
- **Invalid function name** → Returns `#NAME?`.
- **Type mismatch** (e.g. `"hello" + 5`) → Returns `#VALUE!`.

## Parser Depth

The parser uses a **shallow recursion** — at most one recursive call per token in the expression. For typical formulas (e.g. 50 tokens), stack depth stays under 50. No risk of stack overflow for realistic spreadsheet formulas.
