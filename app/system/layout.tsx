import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const SECTIONS = [
  { id: "intro", label: "Visão geral" },
  { id: "tipografia", label: "Tipografia" },
  { id: "cores", label: "Cores" },
  { id: "spacing", label: "Espaçamento" },
  { id: "raio", label: "Raio & borda" },
  { id: "primitivas", label: "Primitivas" },
  { id: "patterns", label: "Patterns" },
];

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> App Finanças
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Design system · v1
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden md:block">
          <nav
            aria-label="Seções do sistema"
            className="sticky top-12 space-y-2 border-l border-border pl-4"
          >
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-muted-foreground transition hover:text-foreground"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
