"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { listenToUserSpreadsheets } from "@/lib/firebase/firestore";
import type { SpreadsheetDocument } from "@/types";
import { DocumentGrid } from "@/components/dashboard/DocumentGrid";

export default function SheetsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
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
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg font-medium text-text-secondary">
          Loading sheets...
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">All Sheets</h1>
          <p className="mt-2 text-base text-text-secondary">
            View and manage all the spreadsheets you have access to.
          </p>
        </div>
      </header>

      <DocumentGrid documents={documents} onOpen={handleOpen} currentUserId={user.uid} />
    </>
  );
}
