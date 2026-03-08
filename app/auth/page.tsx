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
          <div className="inline-flex items-center justify-center self-center rounded-full border border-border-subtle bg-surface-1/60 px-4 py-1.5 text-xs font-medium tracking-wide text-text-secondary md:self-start opacity-90 backdrop-blur-sm transition-colors hover:bg-surface-1 hover:text-text-primary cursor-default">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary/70"></span>
            Real-time collaboration
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
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-surface-1 hover:border-primary/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary">Real-time sync</div>
                <div className="text-sm text-text-secondary mt-1">See edits instantly</div>
              </div>
            </div>
            
            <div className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-surface-1 hover:border-primary/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <span className="font-serif italic text-lg font-medium">fx</span>
              </div>
              <div>
                <div className="font-medium text-text-primary">25+ formulas</div>
                <div className="text-sm text-text-secondary mt-1">SUM, IF, VLOOKUP & more</div>
              </div>
            </div>
            
            <div className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-surface-1 hover:border-primary/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary">Live presence</div>
                <div className="text-sm text-text-secondary mt-1">See who&apos;s editing</div>
              </div>
            </div>
            
            <div className="group flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:bg-surface-1 hover:border-primary/20">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-surface-1 text-text-secondary transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-text-primary">Offline mode</div>
                <div className="text-sm text-text-secondary mt-1">Works without internet</div>
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
          <p>© 2026 Manvi Chadha. Built with Next.js & Firebase.</p>
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


