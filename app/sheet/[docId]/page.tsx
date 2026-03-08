"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSpreadsheet } from "@/hooks/useSpreadsheet";
import { useResize } from "@/hooks/useResize";
import { Toolbar } from "@/components/editor/Toolbar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { SpreadsheetGrid } from "@/components/editor/SpreadsheetGrid";
import { CellContextMenu } from "@/components/editor/CellContextMenu";
import { SyncIndicator } from "@/components/editor/SyncIndicator";
import { PresenceLayer } from "@/components/editor/PresenceLayer";
import { PresenceAvatars } from "@/components/editor/PresenceAvatars";
import { saveMetadata } from "@/lib/firebase/cells";
import { SearchOverlay } from "@/components/editor/SearchOverlay";
import { HeatMapToggle } from "@/components/editor/HeatMapToggle";
import { EditableTitle } from "@/components/editor/EditableTitle";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { ShareModal } from "@/components/editor/ShareModal";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Button } from "@/components/ui/Button";

const DEFAULT_COL_WIDTH = 100;
const DEFAULT_ROW_HEIGHT = 28;

export default function SheetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ docId: string }>();
  const docId = params.docId;

  // Resize state lives here so both grid + presence layer share it
  const { getColumnWidth, getRowHeight, startColumnResize, startRowResize } = useResize({
    defaultWidth: DEFAULT_COL_WIDTH,
    defaultHeight: DEFAULT_ROW_HEIGHT,
    onColumnResize: () => {
      if (docId) saveMetadata(docId, {}).catch(console.error);
    },
    onRowResize: () => {
      if (docId) saveMetadata(docId, {}).catch(console.error);
    },
  });

  const gridScrollRef = useRef<HTMLDivElement | null>(null);
  const [heatMapActive, setHeatMapActive] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Firestore sync
  const { syncState, offlineQueueCount, updateCell } = useSpreadsheet(
    user
      ? { docId: docId ?? "__local__", updatedBy: user.uid }
      : "__local__"
  );

  // Listen for Ctrl+F from keyboard nav
  useEffect(() => {
    const searchHandler = () => setSearchOpen(true);
    const shortcutsHandler = () => setShortcutsOpen(true);
    window.addEventListener("sheet:open-search", searchHandler);
    window.addEventListener("sheet:open-shortcuts", shortcutsHandler);
    return () => {
      window.removeEventListener("sheet:open-search", searchHandler);
      window.removeEventListener("sheet:open-shortcuts", shortcutsHandler);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="glass-panel px-10 py-8 text-lg font-medium text-text-secondary">
          Opening sheet…
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace("/auth");
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-bg-base overflow-hidden">
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface-1 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            aria-label="Back to dashboard"
            className="flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          {/* Inline editable title */}
          <EditableTitle docId={docId} />
        </div>

        <div className="flex items-center gap-4">
          {/* Sync indicator */}
          <SyncIndicator state={syncState} queuedCount={offlineQueueCount} />

          {/* Heat map toggle */}
          <HeatMapToggle active={heatMapActive} onToggle={() => setHeatMapActive((v) => !v)} />

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShareOpen(true)}
            className="hidden sm:flex"
          >
            Share
          </Button>

          {/* Presence avatars */}
          <PresenceAvatars docId={docId} currentUid={user.uid} />

          {/* Current user info */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-text-primary">
                {user.displayName ?? "You"}
              </span>
              <span className="text-xs text-text-muted">{user.email ?? ""}</span>
            </div>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="User avatar"
                className="h-9 w-9 rounded-full border-2 border-border-subtle object-cover"
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border-subtle bg-primary/15 text-sm font-semibold text-primary"
                aria-label="User initials"
              >
                {(user.displayName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-2">
        <Toolbar updatedBy={user.uid} documentTitle="spreadsheet" updateCell={updateCell} />
      </div>

      {/* Formula Bar */}
      <FormulaBar updatedBy={user.uid} updateCell={updateCell} />

      {/* Main Grid Area with optional activity sidebar */}
      <main className="relative flex-1 overflow-hidden p-4">
        <CellContextMenu updatedBy={user.uid}>
          <SpreadsheetGrid
            updatedBy={user.uid}
            updateCell={updateCell}
            heatMap={heatMapActive}
            getColumnWidth={getColumnWidth}
            getRowHeight={getRowHeight}
            startColumnResize={startColumnResize}
            startRowResize={startRowResize}
            scrollRef={gridScrollRef}
            presenceOverlay={
              <PresenceLayer
                docId={docId}
                uid={user.uid}
                displayName={user.displayName ?? user.email ?? "User"}
                getColumnWidth={getColumnWidth}
                getRowHeight={getRowHeight}
              />
            }
          />
        </CellContextMenu>

        {/* Search overlay - positioned relative to main container */}
        {searchOpen && (
          <div className="absolute inset-0 pointer-events-none">
            <SearchOverlay onClose={() => setSearchOpen(false)} />
          </div>
        )}

        {/* Keyboard shortcuts modal */}
        {shortcutsOpen && (
          <KeyboardShortcutsModal
            open={shortcutsOpen}
            onClose={() => setShortcutsOpen(false)}
          />
        )}

        {/* Share modal */}
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          docId={docId}
        />
      </main>
    </div>
    </ErrorBoundary>
  );
}
