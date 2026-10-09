import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../utils/dateUtils';
import { getInitials } from '../../utils/formatters';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              In-App Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Assignment alerts, review mentions, and project status notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={CheckCheck}
            onClick={markAllAsRead}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'unread'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are completely caught up with all tasks, bugs, and team updates."
        />
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800/80 shadow-sm">
          {filtered.map((item) => (
            <div
              key={item._id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-gray-800/40 text-xs ${
                !item.isRead ? 'bg-brand-50/20 dark:bg-brand-950/20' : ''
              }`}
            >
              <div
                className="flex items-start gap-3 flex-1 cursor-pointer"
                onClick={() => {
                  if (!item.isRead) markAsRead(item._id);
                  if (item.link) navigate(item.link);
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {getInitials(item.sender?.name || 'DT')}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!item.isRead && (
                  <button
                    onClick={() => markAsRead(item._id)}
                    className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(item._id)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
