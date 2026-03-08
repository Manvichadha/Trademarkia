"use client";

/**
 * SearchOverlay — Ctrl+F sheet search
 * Opens as a floating overlay, highlights all matching cells with an orange ring.
 * Navigate between matches with Enter / Shift+Enter.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import { useSelectionStore } from "@/store/selectionStore";
import { parseCellId } from "@/lib/spreadsheet/cellAddress";
import type { CellCoord } from "@/lib/spreadsheet/cellAddress";

interface SearchOverlayProps {
  onClose: () => void;
}

export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const [matches, setMatches] = useState<CellCoord[]>([]);
  const { sheet } = useSpreadsheetStore();
  const { setActiveCell } = useSelectionStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Build match list when query changes
  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      setMatchIndex(0);
      return;
    }
    const q = query.toLowerCase();
    const found: CellCoord[] = [];
    for (const [cellId, data] of Object.entries(sheet)) {
      const display = String(data.computed ?? data.raw ?? "").toLowerCase();
      if (display.includes(q)) {
        try {
          found.push(parseCellId(cellId));
        } catch { /* skip */ }
      }
    }
    // Sort by row then col
    found.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
    setMatches(found);
    setMatchIndex(0);
    if (found[0]) setActiveCell(found[0]);
  }, [query, sheet, setActiveCell]);

  const goTo = useCallback(
    (idx: number) => {
      if (matches.length === 0) return;
      const wrapped = ((idx % matches.length) + matches.length) % matches.length;
      setMatchIndex(wrapped);
      const cell = matches[wrapped];
      if (cell) setActiveCell(cell);
    },
    [matches, setActiveCell]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        goTo(e.shiftKey ? matchIndex - 1 : matchIndex + 1);
      }
    },
    [onClose, goTo, matchIndex]
  );

  return (
    <div
      className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3 shadow-xl fade-slide-up"
      role="search"
      aria-label="Search in sheet"
    >
      <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search cells…"
        aria-label="Search query"
        className="w-48 bg-transparent text-sm outline-none placeholder:text-text-muted"
      />
      {matches.length > 0 && (
        <span className="text-xs text-text-muted">
          {matchIndex + 1} / {matches.length}
        </span>
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous match"
          onClick={() => goTo(matchIndex - 1)}
          className="rounded p-1 text-text-muted hover:bg-surface-2 disabled:opacity-40"
          disabled={matches.length === 0}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next match"
          onClick={() => goTo(matchIndex + 1)}
          className="rounded p-1 text-text-muted hover:bg-surface-2 disabled:opacity-40"
          disabled={matches.length === 0}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Close search"
          onClick={onClose}
          className="rounded p-1 text-text-muted hover:bg-surface-2"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
