import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-36" />
      </div>

      <Skeleton className="h-[80px] rounded-lg" />

      <Skeleton className="h-4 w-64" />

      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-12 rounded-md" />
        ))}
      </div>
    </div>
  );
}
