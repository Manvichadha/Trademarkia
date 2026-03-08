"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Toolbar } from "@/components/editor/Toolbar";
import { FormulaBar } from "@/components/editor/FormulaBar";
import { SpreadsheetGrid } from "@/components/editor/SpreadsheetGrid";

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
    <div className="flex min-h-screen flex-col bg-bg-base">
      <header className="flex items-center justify-between border-b border-border-subtle bg-surface-1 px-6 py-3">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">
            Sheet
          </h1>
          <p className="text-xs text-text-secondary">
            Document ID: {docId}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span>{user.displayName ?? user.email ?? "You"}</span>
        </div>
      </header>
      <Toolbar updatedBy={user.uid} />
      <FormulaBar updatedBy={user.uid} />
      <main className="flex flex-1 flex-col px-4 py-4">
        <SpreadsheetGrid updatedBy={user.uid} />
      </main>
    </div>
  );
}

