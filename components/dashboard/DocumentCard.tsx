import { useState } from "react";
import type { SpreadsheetDocument } from "@/types";
import { deleteSpreadsheetDocument } from "@/lib/firebase/firestore";

interface DocumentCardProps {
  document: SpreadsheetDocument;
  onOpen: (id: string) => void;
  index: number;
  currentUserId: string;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function DocumentCard({ document, onOpen, index, currentUserId }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const delay = `${index * 40}ms`;
  const isOwner = document.ownerId === currentUserId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this sheet? This cannot be undone.")) {
      try {
        setIsDeleting(true);
        await deleteSpreadsheetDocument(document.id);
      } catch (err) {
        console.error("Failed to delete document:", err);
        setIsDeleting(false);
        alert("Failed to delete document.");
      }
    }
  };

  const initials = document.title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

  const collaboratorCount = document.collaborators.length;
  const visibleCollabs = document.collaborators.slice(0, 3);

  return (
    <div
      onClick={() => onOpen(document.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(document.id);
        }
      }}
      className={`group relative flex cursor-pointer flex-col justify-between rounded-2xl border-2 border-border-subtle bg-surface-1 p-6 text-left shadow-md outline-none transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base fade-slide-up ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
      style={{ animationDelay: delay }}
      aria-label={`Open spreadsheet ${document.title}`}
    >
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2 text-text-muted opacity-0 transition-all hover:bg-danger/10 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
        aria-label="Delete spreadsheet"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
            {initials || "SH"}
          </div>
          <div>
            <div className="line-clamp-1 text-lg font-semibold text-text-primary">
              {document.title || "Untitled sheet"}
            </div>
            <div className="mt-2 text-sm text-text-secondary">
              Edited {formatRelativeTime(document.updatedAt)}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`rounded-md px-2 py-1 text-xs font-semibold ${isOwner ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
            Auth: {isOwner ? "Owner" : "Shared"}
          </div>
          {collaboratorCount > 0 && (
            <div className="text-xs text-text-secondary">
              • {collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open ↗
        </span>
      </div>
    </div>
  );
}

