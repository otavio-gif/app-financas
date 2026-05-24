"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || "Erro inesperado ao carregar esta página."}
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
