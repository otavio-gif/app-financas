import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { logout } from "../(auth)/actions";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background focus:shadow-[var(--shadow-elevated)]"
      >
        Pular para conteúdo
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
          <Link
            href="/dashboard"
            className="font-sans text-xl font-semibold tracking-[-0.4px]"
          >
            App Finanças
          </Link>
          <AppNav />
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <ThemeToggle />
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto w-full max-w-5xl flex-1 px-6 py-10"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
