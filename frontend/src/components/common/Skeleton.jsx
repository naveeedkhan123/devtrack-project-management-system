import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`}
  />
);

export const SkeletonCard = () => (
  <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-3 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="pt-3 flex justify-between items-center">
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="w-full space-y-3">
    <Skeleton className="h-10 w-full rounded-lg" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full rounded-lg" />
    ))}
  </div>
);

export default Skeleton;
