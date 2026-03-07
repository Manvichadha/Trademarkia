"use client";

import { useState } from "react";
import type { User } from "firebase/auth";
import { ensureUserProfile, signInWithGoogle } from "@/lib/firebase/auth";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useRouter } from "next/navigation";

type AuthStep = "google" | "displayName";

export function AuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("google");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await signInWithGoogle();
      setFirebaseUser(user);
      if (user.displayName) {
        // Existing user with profile; skip display name step.
        await ensureUserProfile(user, user.displayName);
        router.push("/dashboard");
      } else {
        setStep("displayName");
      }
    } catch (err) {
      setError("We couldn’t complete Google sign-in. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!firebaseUser) {
      setError("Your session expired. Please sign in again.");
      setStep("google");
      return;
    }
    if (!displayName.trim()) {
      setError("Please choose a display name.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await ensureUserProfile(firebaseUser, displayName.trim());
      router.push("/dashboard");
    } catch (err) {
      setError("We couldn’t save your profile. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel fade-slide-up w-full max-w-md px-8 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-[0.22em] text-text-muted">
            Welcome to
          </div>
          <div className="mt-1 text-2xl font-semibold text-gradient-brand font-[var(--font-syne)]">
            SHEET
          </div>
        </div>
        <div className="rounded-full bg-surface-3/80 px-3 py-1 text-[11px] font-medium text-text-secondary">
          ● Live collaborative grid
        </div>
      </div>

      {step === "google" && (
        <div className="space-y-6">
          <p className="text-sm text-text-secondary">
            Sign in with Google to claim your identity color and join real-time
            sessions. We only use your email for authentication.
          </p>
          <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />
          {error && (
            <p className="text-xs text-accent-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "displayName" && (
        <div className="space-y-5">
          <p className="text-sm text-text-secondary">
            Choose the name collaborators will see when you appear in a sheet.
          </p>
          <div className="space-y-2">
            <label
              htmlFor="display-name"
              className="text-xs font-medium uppercase tracking-[0.18em] text-text-muted"
            >
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              autoFocus
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-10 w-full rounded-md border border-border-subtle bg-surface-2/80 px-3 text-sm text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. Vega, Harper, Lin"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("google")}
              className="text-xs text-text-muted underline-offset-4 hover:underline"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCompleteProfile}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-xs font-medium uppercase tracking-[0.18em] text-bg-base shadow-lg outline-none transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Enter dashboard"}
            </button>
          </div>
          {error && (
            <p className="text-xs text-accent-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

