import type { ReactNode } from "react";

interface PageHeaderProps {
  overline?: string;
  title: string;
  action?: ReactNode;
  size?: "lg" | "md";
}

/**
 * Soulstory editorial page header: italic-serif tagline (overline) +
 * Mr Eaves sans title at "whispered display" weight, with optional
 * action slot on the right. Hairline rule below.
 */
export function PageHeader({
  overline,
  title,
  action,
  size = "lg",
}: PageHeaderProps) {
  const titleClass =
    size === "lg"
      ? "font-sans text-4xl font-normal leading-[1.08] tracking-[-1.4px] md:text-5xl"
      : "font-sans text-3xl font-normal leading-[1.12] tracking-[-1.0px] md:text-4xl";

  return (
    <header
      className={`flex items-end justify-between gap-4 border-b border-border ${size === "lg" ? "pb-6" : "pb-4"}`}
    >
      <div className="space-y-2">
        {overline && (
          <p className="t-tagline text-muted-foreground">
            {overline}
          </p>
        )}
        <h1 className={titleClass}>{title}</h1>
      </div>
      {action}
    </header>
  );
}
