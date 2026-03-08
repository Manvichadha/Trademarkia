"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Toolbar } from "@/components/editor/Toolbar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { SpreadsheetGrid } from "@/components/editor/SpreadsheetGrid";
import { CellContextMenu } from "@/components/editor/CellContextMenu";

export default function SheetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ docId: string }>();
  const docId = params.docId;

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
    <div className="flex h-screen flex-col bg-bg-base overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface-1 px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div>
            <h1 className="text-lg font-bold text-gradient-brand font-[var(--font-syne)]">
              SHEET
            </h1>
            <p className="text-xs text-text-muted">
              Document ID: {docId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-text-primary">
              {user.displayName ?? "You"}
            </span>
            <span className="text-xs text-text-muted">
              {user.email ?? ""}
            </span>
          </div>
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt="User avatar"
              className="h-10 w-10 rounded-full border-2 border-border-subtle object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border-subtle bg-primary/15 text-sm font-semibold text-primary">
              {(user.displayName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar updatedBy={user.uid} documentTitle="spreadsheet" />

      {/* Formula Bar */}
      <FormulaBar updatedBy={user.uid} />

      {/* Main Grid Area */}
      <main className="flex-1 overflow-hidden p-4">
        <CellContextMenu updatedBy={user.uid}>
          <SpreadsheetGrid updatedBy={user.uid} />
        </CellContextMenu>
      </main>
    </div>
  );
}

