"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createSpreadsheetDocument } from "@/lib/firebase/firestore";
import {
  BLANK_TEMPLATE,
  BUDGET_TEMPLATE,
  TRACKER_TEMPLATE,
  INVOICE_TEMPLATE,
  ROSTER_TEMPLATE,
  type TemplateData
} from "@/lib/utils/templates";

const TEMPLATES = [
  { 
    id: "blank", 
    data: BLANK_TEMPLATE, 
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), 
    color: "bg-surface-2 text-text-secondary" 
  },
  { 
    id: "budget", 
    data: BUDGET_TEMPLATE, 
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ), 
    color: "bg-accent-success/15 text-accent-success" 
  },
  { 
    id: "tracker", 
    data: TRACKER_TEMPLATE, 
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ), 
    color: "bg-primary/15 text-primary" 
  },
  { 
    id: "invoice", 
    data: INVOICE_TEMPLATE, 
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
      </svg>
    ), 
    color: "bg-accent-warning/15 text-accent-warning" 
  },
  { 
    id: "roster", 
    data: ROSTER_TEMPLATE, 
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), 
    color: "bg-secondary/15 text-secondary" 
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [creating, setCreating] = useState<string | null>(null);

  const handleCreateTemplate = async (templateData: TemplateData) => {
    if (!user) return;
    try {
      setCreating(templateData.title);
      const doc = await createSpreadsheetDocument(
        user.uid, 
        templateData.title, 
        templateData.cells,
        templateData.colWidths
      );
      router.push(`/sheet/${doc.id}`);
    } catch (err) {
      console.error(err);
      setCreating(null);
    }
  };

  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Templates</h1>
          <p className="mt-2 text-base text-text-secondary">
            Get started faster with predefined layouts and formulas.
          </p>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => !creating && handleCreateTemplate(tmpl.data)}
            className={`group flex cursor-pointer flex-col rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md ${creating ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <div className={`mb-6 flex h-16 w-16items-center justify-center rounded-xl bg-surface-2 transition-transform group-hover:scale-110 ${tmpl.color} flex items-center justify-center w-16`}>
              {tmpl.icon}
            </div>
            <h3 className="text-lg font-bold text-text-primary">{tmpl.data.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">
              {creating === tmpl.data.title ? "Creating..." : "Click to use template"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
