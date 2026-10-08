import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({
  column,
  tasks,
  onCardClick,
  onAddTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const taskIds = tasks.map((t) => t._id);

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full rounded-2xl bg-gray-100/60 dark:bg-[#111827]/70 border transition-all duration-150 ${
        isOver
          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-inner'
          : 'border-gray-200/80 dark:border-gray-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            {column.title}
          </h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask && onAddTask(column.id)}
          className="p-1 rounded-lg text-gray-400 hover:text-brand-500 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          title={`Add task to ${column.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Cards Scroll Container */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[450px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task._id}
              task={task}
              onClick={onCardClick}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800/80 rounded-xl text-center p-3 text-xs text-gray-400">
            <span>No tasks in this lane</span>
            <button
              onClick={() => onAddTask && onAddTask(column.id)}
              className="text-[11px] text-brand-500 font-semibold mt-1 hover:underline"
            >
              + Create one
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
