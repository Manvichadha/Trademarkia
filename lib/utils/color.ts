/**
 * User color assignment utilities.
 * Curated palette of 12 distinct colors for user identity.
 */

export const USER_COLORS: readonly string[] = [
  "#4F8EF7", // Primary blue
  "#7C3AED", // Purple
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#22D3EE", // Cyan
  "#A855F7", // Violet
  "#F97316", // Orange
  "#14B8A6", // Teal
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#84CC16", // Lime
] as const;

/**
 * Assign a deterministic color from the palette based on user ID.
 * Uses a simple hash function to ensure consistent color assignment.
 */
export function assignUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index]!;
}

/**
 * Get a contrasting text color (black or white) for a given background color.
 * Useful for ensuring text readability on colored backgrounds.
 */
export function getContrastTextColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? "#111827" : "#FFFFFF";
}

/**
 * Format a color with alpha channel for semi-transparent overlays.
 */
export function colorWithAlpha(hexColor: string, alpha: number): string {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A curated palette of 12 colors for text/background color pickers.
 */
export const CELL_COLORS: readonly string[] = [
  "#111827", // Black
  "#374151", // Gray
  "#6B7280", // Light gray
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#84CC16", // Lime
  "#10B981", // Green
  "#14B8A6", // Teal
  "#22D3EE", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#7C3AED", // Purple
  "#A855F7", // Violet
  "#EC4899", // Pink
  "#FFFFFF", // White
] as const;

/**
 * Background colors for cells (lighter tints).
 */
export const CELL_BG_COLORS: readonly string[] = [
  "transparent",
  "#FEE2E2", // Red tint
  "#FED7AA", // Orange tint
  "#FEF3C7", // Amber tint
  "#ECFCCB", // Lime tint
  "#D1FAE5", // Green tint
  "#CCFBF1", // Teal tint
  "#CFFAFE", // Cyan tint
  "#DBEAFE", // Blue tint
  "#E0E7FF", // Indigo tint
  "#EDE9FE", // Purple tint
  "#F3E8FF", // Violet tint
  "#FCE7F3", // Pink tint
  "#F3F4F6", // Gray tint
  "#FFFFFF", // White
  "#1F2937", // Dark gray
] as const;
