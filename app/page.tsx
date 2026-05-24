export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        App Finanças
      </h1>
      <p className="mt-4 max-w-md text-balance text-muted-foreground">
        Controle simples de receitas, despesas e saldo mensal.
      </p>
    </main>
  );
}
