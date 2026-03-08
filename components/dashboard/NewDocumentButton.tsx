"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createSpreadsheetDocument } from "@/lib/firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export function NewDocumentButton({ customTrigger }: { customTrigger?: React.ReactNode } = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user) {
      setError("You need to be signed in to create a sheet.");
      return;
    }
    if (!title.trim()) {
      setError("Please give your sheet a title.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const doc = await createSpreadsheetDocument(user.uid, title.trim());
      setOpen(false);
      setTitle("");
      router.push(`/sheet/${doc.id}`);
    } catch (err) {
      console.error(err);
      setError("We couldn’t create the sheet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {customTrigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer h-full w-full outline-none" role="button" tabIndex={0}>
          {customTrigger}
        </div>
      ) : (
        <Button
          variant="primary"
          size="md"
          onClick={() => setOpen(true)}
          aria-label="Create a new spreadsheet"
          className="h-12 px-6 text-base font-semibold transition-transform hover:scale-105"
        >
          + New spreadsheet
        </Button>
      )}
      <Modal
        open={open}
        title="New spreadsheet"
        description="Name your sheet. You can always change this later."
        onClose={() => {
          if (!submitting) {
            setOpen(false);
          }
        }}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="sheet-title"
              className="text-sm font-semibold uppercase tracking-[0.14em] text-text-muted"
            >
              Title
            </label>
            <input
              id="sheet-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-xl border-2 border-border-subtle bg-surface-2/80 px-4 text-base text-text-primary outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Q2 planning, Growth dashboard..."
            />
          </div>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-4 pt-2">
            <Button
              variant="ghost"
              size="md"
              type="button"
              onClick={() => {
                if (!submitting) {
                  setOpen(false);
                }
              }}
              className="h-12 px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="h-12 px-8 text-base font-semibold"
            >
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

