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
    <>
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
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-2xl border border-border-subtle bg-surface-1/40 backdrop-blur-sm px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md cursor-default">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary transition-colors group-hover:bg-primary/20">
                {documents.length}
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Total sheets</div>
                <div className="text-xl font-bold text-text-primary">{documents.length}</div>
              </div>
            </div>
          </div>
          <div className="group rounded-2xl border border-border-subtle bg-surface-1/40 backdrop-blur-sm px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-success/30 hover:shadow-md cursor-default">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-accent-success transition-all group-hover:bg-accent-success/10 group-hover:border-accent-success/30">
                <div className="h-3 w-3 rounded-full bg-accent-success shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
              </div>
              <div>
                <div className="text-sm font-medium text-text-muted">Status</div>
                <div className="text-xl font-bold text-text-primary">Live</div>
              </div>
            </div>
          </div>
          <NewDocumentButton 
            customTrigger={
              <div className="group h-full rounded-2xl border border-border-subtle bg-surface-1/40 backdrop-blur-sm px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent-warning/40 hover:shadow-md hover:bg-surface-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:bg-accent-warning/10 group-hover:border-accent-warning/30 group-hover:text-accent-warning">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-muted group-hover:text-accent-warning transition-colors">Quick action</div>
                    <div className="text-xl font-bold text-text-primary">New sheet</div>
                  </div>
                </div>
              </div>
            }
          />
          <div className="group rounded-2xl border border-border-subtle bg-surface-1/40 backdrop-blur-sm px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-md cursor-default">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:bg-secondary/10 group-hover:border-secondary/30 group-hover:text-secondary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
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

      <DocumentGrid documents={documents} onOpen={handleOpen} currentUserId={user.uid} />
    </>
  );
}

