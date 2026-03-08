"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listenToUserSpreadsheets } from "@/lib/firebase/firestore";
import type { SpreadsheetDocument } from "@/types";
import { NewDocumentButton } from "@/components/dashboard/NewDocumentButton";
import { DocumentGrid } from "@/components/dashboard/DocumentGrid";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [documents, setDocuments] = useState<SpreadsheetDocument[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return undefined;

    const unsubscribe = listenToUserSpreadsheets(user.uid, setDocuments);
    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleOpen = (id: string) => {
    router.push(`/sheet/${id}`);
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <div className="glass-panel px-10 py-8 text-lg font-medium text-text-secondary">
          Warming up your workspace…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Sidebar */}
      <aside className="hidden w-72 flex-col border-r border-border-subtle bg-surface-1 px-6 py-8 shadow-sm md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-lg font-bold text-primary">
            Sh
          </div>
          <div>
            <div className="text-lg font-bold text-text-primary">Sheet</div>
            <div className="text-sm text-text-muted">Workspace</div>
          </div>
        </div>
        <nav className="space-y-2 text-base">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl bg-primary/12 px-4 py-3 font-semibold text-primary"
          >
            <span>Dashboard</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-text-secondary hover:bg-surface-2"
          >
            <span>Sheets</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-text-secondary hover:bg-surface-2"
          >
            <span>Templates</span>
          </button>
        </nav>
        <div className="mt-auto pt-8 text-sm text-text-muted">
          Designed for focused collaboration.
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-auto px-6 py-8 md:px-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-text-secondary">
              Recent sheets you and your collaborators have touched.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-text-primary">
                {user.displayName ?? "Anonymous user"}
              </span>
              <span className="text-sm text-text-secondary">
                {user.email ?? "Signed in"}
              </span>
            </div>
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="User avatar"
                className="h-11 w-11 rounded-full border-2 border-border-subtle object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-border-subtle bg-surface-2 text-sm font-semibold text-text-secondary">
                {(user.displayName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                void signOut().then(() => {
                  router.replace("/auth");
                });
              }}
              aria-label="Sign out"
            >
              Sign out
            </Button>
          </div>
        </header>

        {/* Summary stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border-subtle bg-surface-1 px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-2xl font-bold text-primary">
                {documents.length}
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Total sheets</div>
                <div className="text-xl font-bold text-text-primary">{documents.length}</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-1 px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-success/15 text-2xl font-bold text-accent-success">
                ●
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Status</div>
                <div className="text-xl font-bold text-text-primary">Live</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-1 px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-warning/15 text-2xl font-bold text-accent-warning">
                +
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Quick action</div>
                <div className="text-xl font-bold text-text-primary">New sheet</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-1 px-6 py-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/15 text-2xl font-bold text-secondary">
                ⚡
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Real-time</div>
                <div className="text-xl font-bold text-text-primary">Synced</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Your spreadsheets</h2>
            <p className="mt-1 text-base text-text-secondary">
              Create a sheet to get started, or jump back into something recent.
            </p>
          </div>
          <NewDocumentButton />
        </div>

        <DocumentGrid documents={documents} onOpen={handleOpen} />
      </div>
    </div>
  );
}

