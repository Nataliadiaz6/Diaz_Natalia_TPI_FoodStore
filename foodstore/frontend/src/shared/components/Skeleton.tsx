export function Skeleton({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-200" />
      ))}
    </div>
  );
}
