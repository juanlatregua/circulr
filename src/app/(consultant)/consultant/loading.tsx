import { Skeleton } from "@/components/ui/skeleton";

export default function ConsultantLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-48 bg-white" />
      <Skeleton className="mt-2 h-4 w-72 bg-white" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl bg-white" />
        ))}
      </div>

      <Skeleton className="mt-8 h-64 rounded-xl bg-white" />
    </div>
  );
}
