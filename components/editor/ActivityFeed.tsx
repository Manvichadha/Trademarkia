"use client";

import { useEffect, useState } from "react";
import { useSpreadsheetStore } from "@/store/spreadsheetStore";
import type { CellData } from "@/lib/spreadsheet/types";

interface ActivityItem {
  id: string;
  cellId: string;
  raw: string;
  updatedAt: number;
  updatedBy: string;
  type: "edit" | "formula" | "format";
}

interface ActivityFeedProps {
  currentUid: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityFeed({ currentUid, isOpen, onClose }: ActivityFeedProps) {
  const { sheet } = useSpreadsheetStore();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const prevSheetRef = useState<typeof sheet | null>(null);

  // Track changes and build activity feed
  useEffect(() => {
    if (!prevSheetRef[0]) {
      prevSheetRef[0] = sheet;
      return;
    }

    const newActivities: ActivityItem[] = [];
    
    // Find changed cells
    for (const [cellId, cell] of Object.entries(sheet)) {
      const prevCell = prevSheetRef[0]?.[cellId];
      
      if (!prevCell || cell.updatedAt > prevCell.updatedAt) {
        newActivities.push({
          id: `${cellId}-${cell.updatedAt}`,
          cellId,
          raw: cell.raw,
          updatedAt: cell.updatedAt,
          updatedBy: cell.updatedBy,
          type: cell.formula ? "formula" : "edit",
        });
      }
    }

    if (newActivities.length > 0) {
      setActivities((prev) => {
        const merged = [...newActivities, ...prev];
        // Keep only last 50 activities
        return merged.slice(0, 50);
      });
    }

    prevSheetRef[0] = sheet;
  }, [sheet]);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h3 className="text-base font-semibold text-text-primary">Activity</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-text-muted hover:bg-surface-2 hover:text-text-secondary"
          aria-label="Close activity feed"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2">
              <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-secondary">No activity yet</p>
            <p className="mt-1 text-xs text-text-muted">Changes you make will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="group rounded-lg border border-border-subtle bg-surface-2 p-3 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      activity.type === "formula" 
                        ? "bg-accent-success/20 text-accent-success" 
                        : "bg-primary/20 text-primary"
                    }`}>
                      {activity.cellId}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTime(activity.updatedAt)}
                    </span>
                  </div>
                  {activity.type === "formula" && (
                    <span className="rounded bg-accent-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-success">
                      Formula
                    </span>
                  )}
                </div>
                
                <div className="mt-2 truncate text-sm text-text-secondary font-mono">
                  {activity.raw || <span className="text-text-muted italic">Cleared</span>}
                </div>
                
                {activity.updatedBy === currentUid && (
                  <div className="mt-1 text-[10px] text-text-muted">You</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border-subtle px-4 py-2 text-center text-xs text-text-muted">
        Showing last {activities.length} changes
      </div>
    </div>
  );
}
