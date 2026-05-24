"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Theme is only known on the client (from localStorage); rendering it
  // during SSR would cause a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button
        size="sm"
        variant="ghost"
        aria-label="Tema"
        className="h-9 w-9 p-0"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  function cycle() {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  }

  const Icon = theme === "system" ? Monitor : theme === "light" ? Sun : Moon;
  const labels = {
    system: "Sistema",
    light: "Claro",
    dark: "Escuro",
  } as const;
  const current = (theme ?? "system") as keyof typeof labels;

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={cycle}
      aria-label={`Tema: ${labels[current]}. Clique para alternar.`}
      title={`Tema: ${labels[current]}`}
      className="h-9 w-9 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
