import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      {[0, 1].map((section) => (
        <section key={section} className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
