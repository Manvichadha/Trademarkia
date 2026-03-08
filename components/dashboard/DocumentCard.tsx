import type { SpreadsheetDocument } from "@/types";

interface DocumentCardProps {
  document: SpreadsheetDocument;
  onOpen: (id: string) => void;
  index: number;
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

export function DocumentCard({ document, onOpen, index }: DocumentCardProps) {
  const delay = `${index * 40}ms`;

  const initials = document.title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");

  const collaboratorCount = document.collaborators.length;
  const visibleCollabs = document.collaborators.slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onOpen(document.id)}
      className="group flex flex-col justify-between rounded-2xl border-2 border-border-subtle bg-surface-1 p-6 text-left shadow-md outline-none transition hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base fade-slide-up"
      style={{ animationDelay: delay }}
      aria-label={`Open spreadsheet ${document.title}`}
    >
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
        <div className="flex -space-x-2">
          {visibleCollabs.map((collabId) => (
            <div
              key={collabId}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg-base bg-surface-2 text-xs font-semibold text-text-secondary"
            >
              {collabId.slice(0, 2).toUpperCase()}
            </div>
          ))}
          {collaboratorCount > visibleCollabs.length ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-border-subtle bg-surface-2 text-xs font-semibold text-text-secondary">
              +{collaboratorCount - visibleCollabs.length}
            </div>
          ) : null}
        </div>
        <span className="text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Open ↗
        </span>
      </div>
    </button>
  );
}

