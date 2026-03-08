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
    <div className="glass-panel fade-slide-up w-full max-w-lg px-10 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-mono uppercase tracking-[0.22em] text-text-muted">
            Welcome to
          </div>
          <div className="mt-2 text-3xl font-bold text-gradient-brand font-[var(--font-syne)]">
            SHEET
          </div>
        </div>
        <div className="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium text-text-secondary">
          ● Live collaborative grid
        </div>
      </div>

      {step === "google" && (
        <div className="space-y-8">
          <p className="text-base leading-relaxed text-text-secondary">
            Sign in with Google to claim your identity color and join real-time
            sessions. We only use your email for authentication.
          </p>
          <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />
          {error && (
            <p className="text-sm text-accent-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      )}

      {step === "displayName" && (
        <div className="space-y-6">
          <p className="text-base leading-relaxed text-text-secondary">
            Choose the name collaborators will see when you appear in a sheet.
          </p>
          <div className="space-y-3">
            <label
              htmlFor="display-name"
              className="text-sm font-medium uppercase tracking-[0.14em] text-text-muted"
            >
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              autoFocus
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="h-12 w-full rounded-xl border border-border-subtle bg-surface-2/80 px-4 text-base text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Vega, Harper, Lin"
            />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setStep("google")}
              className="text-sm text-text-muted underline-offset-4 hover:underline"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleCompleteProfile}
              disabled={loading}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white shadow-lg outline-none transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Enter dashboard"}
            </button>
          </div>
          {error && (
            <p className="text-sm text-accent-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

