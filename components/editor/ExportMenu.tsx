"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { exportSheet, type ExportFormat } from "@/lib/utils/export";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";

interface ExportMenuProps {
  documentTitle?: string;
}

export function ExportMenu({ documentTitle = "spreadsheet" }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { sheet } = useSpreadsheetStore();

  const handleExport = useCallback((format: ExportFormat) => {
    exportSheet(sheet, format, documentTitle);
    setIsOpen(false);
  }, [sheet, documentTitle]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const formats: { value: ExportFormat; label: string; description: string }[] = [
    { value: "csv", label: "CSV", description: "Comma-separated values" },
    { value: "xlsx", label: "Excel", description: "Microsoft Excel format" },
    { value: "json", label: "JSON", description: "JSON data format" },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition hover:bg-surface-3"
        aria-label="Export spreadsheet"
        aria-expanded={isOpen}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Export
        <svg
          className="h-3 w-3 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-48 rounded-lg border border-border-subtle bg-surface-1 py-2 shadow-lg"
          role="menu"
          aria-label="Export options"
        >
          {formats.map((format) => (
            <button
              key={format.value}
              type="button"
              role="menuitem"
              onClick={() => handleExport(format.value)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-text-primary transition hover:bg-surface-2"
            >
              <span className="font-medium">{format.label}</span>
              <span className="text-xs text-text-muted">{format.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
