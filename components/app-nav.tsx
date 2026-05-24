"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transações" },
  { href: "/categories", label: "Categorias" },
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Principal" className="flex items-center gap-4 text-sm">
      {LINKS.map((link) => {
        const active = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`transition hover:text-foreground ${
              active
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
