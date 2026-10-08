import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, MessageSquare, AlertCircle, Clock } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import { getInitials } from '../../utils/formatters';

const KanbanCard = ({ task, onClick, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task,
    },
    disabled: isOverlay,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className={`group relative p-4 rounded-xl border bg-white dark:bg-[#111827] shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-brand-500/50 hover:shadow-md ${
        isDragging
          ? 'opacity-30 border-dashed border-brand-500'
          : 'border-gray-200 dark:border-gray-800'
      } ${isOverlay ? 'shadow-2xl ring-2 ring-brand-500/50 rotate-1 scale-105' : ''}`}
    >
      {/* Top Header: Project Key & Priority Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {task.project?.key || 'DEV'}
        </span>
        <Badge type="priority" variant={task.priority} size="xs" />
      </div>

      {/* Task Title */}
      <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 mb-2.5">
        {task.title}
      </h4>

      {/* Labels Pills */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300"
            >
              {lbl}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[9px] text-gray-400 font-medium self-center">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Due Date & Assignee / Comments */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80 text-[11px] text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {task.dueDate ? (
            <span
              className={`flex items-center gap-1 ${
                overdue ? 'text-rose-500 font-bold' : ''
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formatDate(task.dueDate, { month: 'numeric', day: 'numeric' })}
            </span>
          ) : (
            <span className="text-gray-400 text-[10px]">No date</span>
          )}

          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-3 h-3" />
              {task.commentsCount}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignedTo ? (
          <div
            className="w-5 h-5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[9px] flex items-center justify-center border border-brand-500/20"
            title={task.assignedTo.name}
          >
            {getInitials(task.assignedTo.name)}
          </div>
        ) : (
          <div
            className="w-5 h-5 rounded-md border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-[9px] text-gray-400"
            title="Unassigned"
          >
            -
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanCard;
