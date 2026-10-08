import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
    <table className={`w-full text-left text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead
    className={`bg-gray-50/80 dark:bg-gray-900/60 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 ${className}`}
  >
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-gray-100 dark:divide-gray-800/80 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', hover = true, onClick }) => (
  <tr
    onClick={onClick}
    className={`transition-colors duration-150 ${
      hover ? 'hover:bg-gray-50/70 dark:hover:bg-gray-800/40' : ''
    } ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-4 py-3.5 tracking-wider ${className}`}>{children}</th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-4 py-3.5 align-middle ${className}`}>{children}</td>
);

export default Table;
