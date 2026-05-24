"use client";

import dynamic from "next/dynamic";

export const DashboardCharts = dynamic(
  () => import("./charts").then((m) => m.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-[380px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[380px] animate-pulse rounded-xl border bg-card" />
      </div>
    ),
  },
);
