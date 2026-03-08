"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Check for existing class on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    alert(notificationsEnabled ? "Notifications disabled" : "Notifications enabled");
  };
  
  return (
    <>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="mt-2 text-base text-text-secondary">
            Manage your workspace and account preferences.
          </p>
        </div>
      </header>

      <div className="max-w-3xl space-y-6">
        <div className="rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
          <div className="mt-6 flex items-center gap-6">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt="User avatar"
                className="h-20 w-20 rounded-full border-4 border-surface-2 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface-2 bg-primary/10 text-xl font-bold text-primary shadow-sm">
                {(user?.displayName ?? user?.email ?? "?").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-lg font-medium text-text-primary">{user?.displayName ?? "Anonymous user"}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
              <p className="mt-1 text-xs text-text-muted">Account ID: {user?.uid}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-1/40 p-6 shadow-sm backdrop-blur-sm">
          <h2 className="text-lg font-bold text-text-primary">Workspace Preferences</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Customize how your workspace looks and acts.
          </p>
          <div className="mt-6 flex gap-4">
            <Button variant="ghost" size="md" onClick={toggleTheme}>
              {theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
            </Button>
            <Button variant="ghost" size="md" onClick={toggleNotifications}>
              {notificationsEnabled ? "Disable Notifications" : "Enable Notifications"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
