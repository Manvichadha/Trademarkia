"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface Shortcut {
  category: string;
  items: Array<{ keys: string; description: string }>;
}

const SHORTCUTS: Shortcut[] = [
  {
    category: "Navigation",
    items: [
      { keys: "↑↓←→", description: "Move between cells" },
      { keys: "Tab / Shift+Tab", description: "Move right / left" },
      { keys: "Enter", description: "Edit current cell" },
      { keys: "Escape", description: "Cancel editing" },
      { keys: "Home", description: "Jump to A1" },
      { keys: "End", description: "Jump to last cell with data" },
    ],
  },
  {
    category: "Editing",
    items: [
      { keys: "F2 / Enter", description: "Enter edit mode" },
      { keys: "Delete / Backspace", description: "Clear cell content" },
      { keys: "Ctrl+C", description: "Copy selection" },
      { keys: "Ctrl+V", description: "Paste" },
      { keys: "Ctrl+X", description: "Cut" },
    ],
  },
  {
    category: "Formatting",
    items: [
      { keys: "Ctrl+B", description: "Toggle bold" },
      { keys: "Ctrl+I", description: "Toggle italic" },
    ],
  },
  {
    category: "History",
    items: [
      { keys: "Ctrl+Z", description: "Undo" },
      { keys: "Ctrl+Y / Ctrl+Shift+Z", description: "Redo" },
    ],
  },
  {
    category: "Search & Help",
    items: [
      { keys: "Ctrl+F", description: "Search in sheet" },
      { keys: "Ctrl+/ / Cmd+/", description: "Show keyboard shortcuts" },
    ],
  },
];

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Escape" || e.key === "?") && open && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return (
    <Modal open={true} onClose={onClose} title="Keyboard Shortcuts">
      <div className="max-h-[70vh] overflow-y-auto px-2">
        <div className="grid gap-6 md:grid-cols-2">
          {SHORTCUTS.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-sm font-semibold text-text-primary">
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-2"
                  >
                    <span className="text-sm text-text-secondary">
                      {shortcut.description}
                    </span>
                    <kbd className="rounded-md bg-bg-base px-2 py-1 text-xs font-mono font-medium text-text-primary shadow-sm">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border-subtle bg-surface-2 p-4 text-center text-sm text-text-muted">
          <p>
            Pro tip: Click on any cell and start typing to enter data. Double-click to edit
            formulas.
          </p>
        </div>
      </div>
    </Modal>
  );
}
