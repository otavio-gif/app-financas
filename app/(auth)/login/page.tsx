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
          <h1 className="font-sans text-5xl font-normal leading-[1.05] tracking-[-1.4px]">
            Dinheiro é<br />
            <em className="not-italic text-[color:var(--income)]">só</em> dinheiro
            <br />
            quando você<br />
            o <em className="t-tagline text-[length:inherit]">conhece</em>.
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Um caderno digital pras suas receitas e despesas. Sem fricção,
            sem anúncio, sem categoria mágica feita por algoritmo.
          </p>
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Edição 001 · Maio 2026
        </p>
      </aside>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Acesso
            </p>
            <h2 className="font-sans text-3xl font-normal tracking-[-1.0px]">
              Entrar
            </h2>
          </header>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
