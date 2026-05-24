import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-10">
      <div className="space-y-3 border-b border-border pb-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-48" />
      </div>

      <div className="grid gap-x-12 gap-y-8 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2 border-l border-border pl-5 md:border-l-0 md:border-t md:pl-0 md:pt-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-8 border-y border-border py-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-sm" />
        <Skeleton className="h-[320px] rounded-sm" />
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <Skeleton className="h-7 w-48" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-baseline justify-between py-3">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
