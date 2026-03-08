"use client";

import { useState } from "react";
import { addCollaborator } from "@/lib/firebase/firestore";
import { Button } from "@/components/ui/Button";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  docId: string;
}

export function ShareModal({ open, onClose, docId }: ShareModalProps) {
  const [uid, setUid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid.trim()) {
      setError("Please enter a valid User ID.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await addCollaborator(docId, uid.trim());
      onClose();
    } catch (err) {
      console.error("Failed to add collaborator:", err);
      setError("Failed to add collaborator. Ensure you have permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-base/80 p-4 backdrop-blur-sm">
      <div 
        className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-1 p-6 shadow-2xl fade-slide-up"
        role="dialog"
        aria-labelledby="share-modal-title"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 id="share-modal-title" className="text-xl font-bold text-text-primary">
              Share Spreadsheet
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              Grant someone else access to this document. They will appear as a 
              collaborator and can edit live alongside you.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close dialog"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="uid-input" className="block text-sm font-semibold text-text-primary">
              Collaborator User ID (UID)
            </label>
            <input
              id="uid-input"
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              placeholder="Ex: aB1cD2eF3gH4iJ5..."
              className="mt-2 w-full rounded-xl border border-border-subtle bg-surface-2 px-4 py-3 text-text-primary placeholder:text-text-muted hover:border-border-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              disabled={isSubmitting}
            />
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
            
            <div className="mt-4 rounded-lg bg-surface-2 p-3 text-xs text-text-secondary">
              <strong>Tip to test sharing:</strong> Login to a different Google account on an incognito window, open Settings to find your UID, and paste it here!
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviting..." : "Invite"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
