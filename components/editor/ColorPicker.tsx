"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CELL_COLORS, CELL_BG_COLORS } from "@/lib/utils/color";

interface ColorPickerProps {
  selectedColor: string | undefined;
  onColorSelect: (color: string) => void;
  type: "text" | "background";
  onClose?: () => void;
}

export function ColorPicker({ selectedColor, onColorSelect, type, onClose }: ColorPickerProps) {
  const colors = type === "text" ? CELL_COLORS : CELL_BG_COLORS;
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleColorClick = useCallback((color: string) => {
    onColorSelect(color);
    onClose?.();
  }, [onColorSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-border-subtle bg-surface-1 p-3 shadow-lg"
      role="dialog"
      aria-label={`${type === "text" ? "Text" : "Background"} color picker`}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        {type === "text" ? "Text Color" : "Background Color"}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => handleColorClick(color)}
            className={`color-swatch h-6 w-6 rounded-md border ${
              color === "transparent"
                ? "border-border-subtle bg-surface-1"
                : color === "#FFFFFF"
                  ? "border-border-subtle"
                  : "border-transparent"
            } ${selectedColor === color ? "active" : ""}`}
            style={{
              backgroundColor: color === "transparent" ? undefined : color,
              backgroundImage: color === "transparent"
                ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                : undefined,
              backgroundSize: color === "transparent" ? "6px 6px" : undefined,
              backgroundPosition: color === "transparent" ? "0 0, 0 3px, 3px -3px, -3px 0px" : undefined,
            }}
            aria-label={color === "transparent" ? "No color" : color}
          />
        ))}
      </div>
    </div>
  );
}

interface ColorPickerButtonProps {
  selectedColor: string | undefined;
  onColorSelect: (color: string) => void;
  type: "text" | "background";
  label: string;
}

export function ColorPickerButton({ selectedColor, onColorSelect, type, label }: ColorPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-md px-2 text-sm transition hover:bg-surface-3"
        aria-label={label}
        aria-expanded={isOpen}
      >
        {type === "text" ? (
          <span
            className="font-bold"
            style={{ color: selectedColor || "inherit" }}
          >
            A
          </span>
        ) : (
          <span
            className="flex h-5 w-5 items-center justify-center rounded border border-border-subtle"
            style={{ backgroundColor: selectedColor && selectedColor !== "transparent" ? selectedColor : "transparent" }}
          >
            <span className="text-xs font-bold" style={{ color: selectedColor && selectedColor !== "transparent" ? "#fff" : "inherit" }}>
              A
            </span>
          </span>
        )}
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
        <ColorPicker
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
          type={type}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
