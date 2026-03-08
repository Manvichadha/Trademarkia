"use client";

import { useCallback, useState, useEffect, useRef } from "react";
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
  // Track whether the user is currently editing so we don't stomp their input
  const isEditingRef = useRef(false);

  // Sync from store when active cell changes or remote update comes in
  useEffect(() => {
    if (!isEditingRef.current) {
      const t = setTimeout(() => setInputValue(raw), 0);
      return () => clearTimeout(t);
    }
  }, [cellId, raw]);

  const isFormula = inputValue.trim().startsWith("=");
  const tokens = isFormula ? getFormulaTokens(inputValue) : [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      isEditingRef.current = true;
      setInputValue(e.target.value);
      // Do NOT call updateCell here — wait for Enter or blur
    },
    []
  );

  const commitValue = useCallback(
    (value: string) => {
      isEditingRef.current = false;
      if (cellId) {
        updateCell(cellId, value);
      }
    },
    [cellId, updateCell]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitValue(inputValue);
      } else if (e.key === "Escape") {
        e.preventDefault();
        isEditingRef.current = false;
        setInputValue(raw);
        (e.target as HTMLInputElement).blur();
      }
    },
    [inputValue, raw, commitValue]
  );

  const handleBlur = useCallback(() => {
    commitValue(inputValue);
  }, [inputValue, commitValue]);

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
          onKeyDown={handleKeyDown}
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
