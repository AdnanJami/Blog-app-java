// src/components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card">
      <div className="skeleton h-5 w-20 rounded-full mb-3" />
      <div className="skeleton h-5 w-full rounded mb-2" />
      <div className="skeleton h-5 w-4/5 rounded mb-4" />
      <div className="skeleton h-16 w-full rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-14 rounded" />
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-12 rounded" />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </div>
      </div>
    </div>
  );
}
