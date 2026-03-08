"use client";

/**
 * EditableTitle
 * Clicking the title turns it into an inline input.
 * Changes are debounced 600ms then saved to Firestore.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { subscribeToMetadata, updateDocumentTitle } from "@/lib/firebase/cells";

interface EditableTitleProps {
  docId: string;
}

export function EditableTitle({ docId }: EditableTitleProps) {
  const [title, setTitle] = useState("Untitled");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to metadata for live title updates
  useEffect(() => {
    const unsub = subscribeToMetadata(
      docId,
      (meta) => setTitle(meta.title),
      console.error
    );
    return unsub;
  }, [docId]);

  const startEdit = useCallback(() => {
    setDraft(title);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }, [title]);

  const commitEdit = useCallback(
    async (value: string) => {
      setEditing(false);
      const trimmed = value.trim() || "Untitled";
      setTitle(trimmed);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          await updateDocumentTitle(docId, trimmed);
        } catch (err) {
          console.error("[EditableTitle] save error:", err);
        }
      }, 600);
    },
    [docId]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") commitEdit(draft);
      if (e.key === "Escape") {
        setEditing(false);
        setDraft(title);
      }
    },
    [draft, title, commitEdit]
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commitEdit(draft)}
        onKeyDown={handleKeyDown}
        aria-label="Document title"
        className="rounded border border-primary/50 bg-surface-1 px-2 py-0.5 text-lg font-bold text-gradient-brand font-[var(--font-syne)] outline-none ring-1 ring-primary/20"
        style={{ minWidth: 120 }}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      aria-label="Edit document title"
      className="rounded px-1 text-lg font-bold text-gradient-brand font-[var(--font-syne)] transition hover:bg-surface-2"
      title="Click to rename"
    >
      {title}
    </button>
  );
}
