import React from 'react';
import {
  getStatusBadgeClass,
  getPriorityBadgeClass,
  getSeverityBadgeClass,
  formatStatus,
} from '../../utils/formatters';

const Badge = ({
  children,
  type = 'default',
  variant,
  size = 'sm',
  className = '',
}) => {
  let colorClasses = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';

  if (type === 'status' && variant) {
    colorClasses = getStatusBadgeClass(variant);
  } else if (type === 'priority' && variant) {
    colorClasses = getPriorityBadgeClass(variant);
  } else if (type === 'severity' && variant) {
    colorClasses = getSeverityBadgeClass(variant);
  }

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2.5 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const displayText = children || (variant ? formatStatus(variant) : '');

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border border-transparent tracking-wide select-none ${colorClasses} ${sizes[size] || sizes.sm} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default Badge;
