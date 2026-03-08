"use client";

import { useCallback } from "react";
import { useSelectionStore } from "@/store/selectionStore";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { toCellId } from "@/lib/spreadsheet/cellAddress";

interface ToolbarProps {
  updatedBy: string;
}

export function Toolbar({ updatedBy }: ToolbarProps) {
  const { activeCell } = useSelectionStore();
  const { sheet } = useSpreadsheetStore();
  const { updateCell } = useSpreadsheet(updatedBy);

  const cellId = activeCell ? toCellId(activeCell) : null;
  const cell = cellId ? sheet[cellId] : null;
  const formatting = cell?.formatting ?? {};

  const toggleBold = useCallback(() => {
    if (cellId) {
      updateCell(cellId, cell?.raw ?? "", {
        ...formatting,
        bold: !formatting.bold,
      });
    }
  }, [cellId, cell?.raw, formatting, updateCell]);

  const toggleItalic = useCallback(() => {
    if (cellId) {
      updateCell(cellId, cell?.raw ?? "", {
        ...formatting,
        italic: !formatting.italic,
      });
    }
  }, [cellId, cell?.raw, formatting, updateCell]);

  const setAlign = useCallback(
    (align: "left" | "center" | "right") => {
      if (cellId) {
        updateCell(cellId, cell?.raw ?? "", { ...formatting, align });
      }
    },
    [cellId, cell?.raw, formatting, updateCell]
  );

  return (
    <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-2 px-4 py-2">
      <button
        type="button"
        onClick={toggleBold}
        className={`rounded px-3 py-1.5 text-sm font-semibold transition ${
          formatting.bold ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
        }`}
        aria-label="Bold"
      >
        B
      </button>
      <button
        type="button"
        onClick={toggleItalic}
        className={`rounded px-3 py-1.5 text-sm italic transition ${
          formatting.italic ? "bg-primary/20 text-primary" : "hover:bg-surface-3"
        }`}
        aria-label="Italic"
      >
        I
      </button>
      <div className="mx-2 h-6 w-px bg-border-subtle" />
      <button
        type="button"
        onClick={() => setAlign("left")}
        className="rounded px-2 py-1 text-xs hover:bg-surface-3"
        aria-label="Align left"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => setAlign("center")}
        className="rounded px-2 py-1 text-xs hover:bg-surface-3"
        aria-label="Align center"
      >
        ≡
      </button>
      <button
        type="button"
        onClick={() => setAlign("right")}
        className="rounded px-2 py-1 text-xs hover:bg-surface-3"
        aria-label="Align right"
      >
        ≡
      </button>
    </div>
  );
}
