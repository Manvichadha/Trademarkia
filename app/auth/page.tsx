"use client";

import { AuthForm } from "@/components/auth/AuthForm";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-bg-base px-6 py-16 md:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-7xl items-center gap-16">
        <div className="hidden flex-1 flex-col gap-8 pr-12 md:flex">
          <span className="text-sm font-mono uppercase tracking-[0.24em] text-text-muted">
            Sheet
          </span>
          <h1 className="text-4xl font-bold leading-tight text-text-primary md:text-5xl">
            A spreadsheet that feels like a modern dashboard.
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
            Stay in flow with a calm, minimal interface while your team edits in
            real time. No clutter, no noise—just a focused canvas for numbers.
          </p>
          <div className="mt-4 flex flex-wrap gap-6">
            <div className="flex items-center gap-3 rounded-xl bg-surface-1 px-5 py-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-xl font-bold text-primary">
                ✓
              </div>
              <div>
                <div className="font-semibold text-text-primary">Real-time sync</div>
                <div className="text-sm text-text-secondary">See edits as they happen</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-surface-1 px-5 py-4 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-success/15 text-xl font-bold text-accent-success">
                +
              </div>
              <div>
                <div className="font-semibold text-text-primary">Formulas & charts</div>
                <div className="text-sm text-text-secondary">Full spreadsheet power</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0 max-w-xl">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}


