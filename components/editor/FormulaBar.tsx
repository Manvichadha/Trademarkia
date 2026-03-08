"use client";

import { useCallback, useState, useEffect } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { toCellId } from "@/lib/spreadsheet/cellAddress";
import { getFormulaTokens, type TokenType } from "@/lib/spreadsheet/parser";

interface FormulaBarProps {
  updatedBy: string;
}

const TOKEN_COLORS: Record<TokenType, string> = {
  FUNCTION: "bg-primary/20 text-primary",
  OPERATOR: "bg-surface-3 text-text-muted",
  CELL_REF: "bg-accent-success/20 text-accent-success",
  RANGE: "bg-accent-success/20 text-accent-success",
  NUMBER: "bg-accent-warning/20 text-accent-warning",
  STRING: "bg-accent-warning/20 text-accent-warning",
  LPAREN: "bg-surface-3 text-text-muted",
  RPAREN: "bg-surface-3 text-text-muted",
  COMMA: "bg-surface-3 text-text-muted",
  EOF: "",
};

export function FormulaBar({ updatedBy }: FormulaBarProps) {
  const { activeCell } = useSelectionStore();
  const { sheet } = useSpreadsheetStore();
  const { updateCell } = useSpreadsheet(updatedBy);

  const cellId = activeCell ? toCellId(activeCell) : null;
  const cell = cellId ? sheet[cellId] : null;
  const raw = cell?.raw ?? "";

  const [inputValue, setInputValue] = useState(raw);

  useEffect(() => {
    setInputValue(raw);
  }, [cellId, raw]);

  const isFormula = raw.trim().startsWith("=");
  const tokens = isFormula ? getFormulaTokens(raw) : [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setInputValue(v);
      if (cellId) {
        updateCell(cellId, v);
      }
    },
    [cellId, updateCell]
  );

  const handleBlur = useCallback(() => {
    if (cellId && inputValue !== raw) {
      updateCell(cellId, inputValue);
    }
  }, [cellId, inputValue, raw, updateCell]);

  return (
    <div className="flex flex-col gap-2 border-b border-border-subtle bg-surface-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 min-w-14 items-center justify-center rounded bg-surface-3 font-mono text-sm font-medium text-text-primary"
          aria-label="Active cell"
        >
          {cellId ?? "—"}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`flex-1 rounded-lg border px-3 py-2 font-mono text-sm outline-none transition-colors ${
            isFormula
              ? "border-primary bg-primary/5 ring-1 ring-primary/30"
              : "border-border-subtle bg-surface-1"
          }`}
          placeholder="Enter value or formula"
          aria-label="Formula bar"
        />
      </div>
      {isFormula && tokens.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t, i) => (
            <span
              key={i}
              className={`rounded px-2 py-0.5 text-xs font-mono ${TOKEN_COLORS[t.type] ?? "bg-surface-3 text-text-secondary"}`}
            >
              {String(t.value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
