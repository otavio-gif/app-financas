"use client";

import dynamic from "next/dynamic";

export const DashboardCharts = dynamic(
  () => import("./charts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-8 border-y border-border py-6 lg:grid-cols-2">
        <div className="h-[320px] animate-pulse rounded-sm bg-muted/40" />
        <div className="h-[320px] animate-pulse rounded-sm bg-muted/40" />
      </div>
    ),
  },
);
