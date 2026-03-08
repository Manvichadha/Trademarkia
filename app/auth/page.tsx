"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import Link from "next/link";

export default function AuthPage() {
  return (
    <div className="relative min-h-screen bg-bg-base overflow-hidden">
      {/* Ambient background grid */}
      <div className="absolute inset-0 ambient-grid opacity-30" />
      
      {/* Navbar */}
      <nav className="relative z-10 border-b border-border-subtle bg-surface-1/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
              Sh
            </div>
            <span className="text-lg font-bold text-text-primary">Sheet</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition"
            >
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-16 px-6 py-16 md:flex-row md:items-start md:gap-20 md:px-12 md:py-24">
        {/* Left side - Hero */}
        <div className="flex flex-1 flex-col gap-8 text-center md:text-left">
          <div className="inline-flex items-center justify-center self-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary md:self-start">
            ✨ Real-time collaboration made simple
          </div>
          
          <h1 className="text-4xl font-bold leading-tight text-text-primary md:text-5xl lg:text-6xl">
            The spreadsheet that{" "}
            <span className="text-gradient-brand">feels fast</span>
          </h1>
          
          <p className="max-w-lg text-lg leading-relaxed text-text-secondary">
            Stay in flow with a calm, minimal interface while your team edits in
            real time. No clutter, no noise—just a focused canvas for numbers.
          </p>

          {/* Feature cards */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-5 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-lg font-bold text-primary">
                ✓
              </div>
              <div>
                <div className="font-semibold text-text-primary">Real-time sync</div>
                <div className="text-sm text-text-secondary">See edits instantly</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-5 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-success/15 text-lg font-bold text-accent-success">
                ∑
              </div>
              <div>
                <div className="font-semibold text-text-primary">25+ formulas</div>
                <div className="text-sm text-text-secondary">SUM, IF, VLOOKUP & more</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-5 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-warning/15 text-lg font-bold text-accent-warning">
                👥
              </div>
              <div>
                <div className="font-semibold text-text-primary">Live presence</div>
                <div className="text-sm text-text-secondary">See who&apos;s editing</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-surface-1 p-5 shadow-sm transition hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-lg font-bold text-secondary">
                ⚡
              </div>
              <div>
                <div className="font-semibold text-text-primary">Offline mode</div>
                <div className="text-sm text-text-secondary">Works without internet</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full max-w-md flex-1">
          <AuthForm />
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border-subtle bg-surface-1/50 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-text-muted md:flex-row md:px-12">
          <p>© 2024 Trademarkia. Built with Next.js & Firebase.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-secondary transition">Privacy</a>
            <a href="#" className="hover:text-text-secondary transition">Terms</a>
            <a href="#" className="hover:text-text-secondary transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}


