import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh w-full md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between border-r border-border bg-secondary px-10 py-12 md:flex">
        <Link
          href="/"
          className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          App Finanças
        </Link>
        <div className="space-y-6">
          <h1 className="font-heading text-5xl font-light leading-[1.05] tracking-tight">
            Dinheiro é<br />
            <em className="text-[color:var(--income)]">só</em> dinheiro
            <br />
            quando você<br />
            o <em className="italic">conhece</em>.
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Um caderno digital pras suas receitas e despesas. Sem fricção,
            sem anúncio, sem categoria mágica feita por algoritmo.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Edição 001 · Maio 2026
        </p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Acesso
            </p>
            <h2 className="font-heading text-3xl font-light tracking-tight">
              Entrar
            </h2>
          </header>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
