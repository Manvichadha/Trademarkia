"use client";

import type { SpreadsheetDocument } from "@/types";
import { DocumentCard } from "./DocumentCard";

interface DocumentGridProps {
  documents: SpreadsheetDocument[];
  onOpen: (id: string) => void;
}

export function DocumentGrid({ documents, onOpen }: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-border-subtle bg-surface-1/50 px-12 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10">
            <div className="h-12 w-12 rounded-xl border-2 border-dashed border-primary/50 bg-surface-2" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            Your grid is a blank canvas
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
            Spin up your first spreadsheet and we&apos;ll keep everything in sync in real
            time. Perfect for experiments, dashboards, or collaboration.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border-subtle bg-surface-1 px-5 py-4 text-left">
              <div className="text-lg font-semibold text-primary">Formulas</div>
              <div className="mt-1 text-sm text-text-secondary">SUM, AVERAGE, IF, and more</div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-1 px-5 py-4 text-left">
              <div className="text-lg font-semibold text-primary">Real-time</div>
              <div className="mt-1 text-sm text-text-secondary">See edits as they happen</div>
            </div>
            <div className="rounded-xl border border-border-subtle bg-surface-1 px-5 py-4 text-left">
              <div className="text-lg font-semibold text-primary">Export</div>
              <div className="mt-1 text-sm text-text-secondary">CSV, JSON, XLSX</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {documents.map((doc, index) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onOpen={onOpen}
          index={index}
        />
      ))}
    </div>
  );
}

