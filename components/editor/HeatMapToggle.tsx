"use client";

/**
 * HeatMapToggle — toolbar toggle for Cell Heat Map mode.
 * When active, cells are given a green-tinted background based on
 * how recently they were updated (updatedAt timestamp).
 * The heat map is driven by a requestAnimationFrame loop in the Cell component.
 */

interface HeatMapToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function HeatMapToggle({ active, onToggle }: HeatMapToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={active ? "Disable heat map" : "Enable heat map"}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
        active
          ? "bg-success/15 text-success ring-1 ring-success/30"
          : "bg-surface-3 text-text-secondary hover:bg-surface-2"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${active ? "bg-success animate-pulse" : "bg-text-muted"}`}
      />
      Heat Map
    </button>
  );
}
