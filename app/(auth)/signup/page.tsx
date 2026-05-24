import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
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
            Comece a<br />
            <em>escrever</em><br />
            seu próprio<br />
            balanço.
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Crie uma conta. Doze categorias padrão chegam junto, prontas pra
            você ajustar. Sem cartão, sem trial.
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
              Cadastro
            </p>
            <h2 className="font-heading text-3xl font-light tracking-tight">
              Criar conta
            </h2>
          </header>
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
