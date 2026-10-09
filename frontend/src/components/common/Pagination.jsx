import React from 'react';

const Pagination = ({ page, limit, total, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-800 px-4 py-3 text-xs"
    >
      <span className="text-gray-500 dark:text-gray-400">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        <span aria-live="polite" className="text-gray-600 dark:text-gray-300">
          Page {page} of {pages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
