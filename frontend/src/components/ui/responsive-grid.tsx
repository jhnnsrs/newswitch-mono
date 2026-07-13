import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  /** Minimum item width in pixels before wrapping to fewer columns */
  minItemWidth?: number;
}

/**
 * A responsive grid container that uses CSS container queries to determine
 * the number of columns based on the container's width (not viewport).
 *
 * - Below 300px: 1 column
 * - 300px-500px: 2 columns
 * - 500px-700px: 3 columns
 * - Above 700px: 4 columns
 */
export function ResponsiveGrid({ children, className }: ResponsiveGridProps) {
  return (
    <div className={cn("@container", className)}>
      <div
        className={cn(
          "grid gap-2",
          "grid-cols-1",
          "@[300px]:grid-cols-2",
          "@[500px]:grid-cols-3",
          "@[700px]:grid-cols-4",
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ResponsiveGridItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * A grid item wrapper for use inside ResponsiveGrid.
 * Provides consistent styling for items.
 */
export function ResponsiveGridItem({
  children,
  className,
}: ResponsiveGridItemProps) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}
