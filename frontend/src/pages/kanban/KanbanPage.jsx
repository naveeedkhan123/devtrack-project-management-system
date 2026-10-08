import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Kanban as KanbanIcon,
  Plus,
  Search,
  Filter,
  FolderKanban,
  RotateCcw,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import KanbanColumn from '../../components/kanban/KanbanColumn';
import KanbanCard from '../../components/kanban/KanbanCard';
import TaskModal from '../../components/tasks/TaskModal';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const COLUMNS = [
  { id: 'todo', title: 'TODO', color: 'bg-gray-400' },
  { id: 'in_progress', title: 'IN PROGRESS', color: 'bg-blue-500' },
  { id: 'review', title: 'REVIEW', color: 'bg-purple-500' },
  { id: 'completed', title: 'COMPLETED', color: 'bg-emerald-500' },
];

const KanbanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('project') || 'all';

  const [selectedProject, setSelectedProject] = useState(initialProjectId);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Dragging state
  const [activeTask, setActiveTask] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [targetColumnForNew, setTargetColumnForNew] = useState('todo');

  const { success, error } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectService.getProjects();
        if (res?.data?.projects) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        console.error('Failed to load projects for kanban filter:', err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProject !== 'all') {
        params.project = selectedProject;
      }
      const res = await taskService.getTasks(params);
      if (res?.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedProject, error]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleProjectChange = (e) => {
    const projId = e.target.value;
    setSelectedProject(projId);
    if (projId === 'all') {
      searchParams.delete('project');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ project: projId });
    }
  };

  // Filter tasks locally by search & priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.project?.key?.toLowerCase().includes(search.toLowerCase()) ||
        t.labels?.some((l) => l.toLowerCase().includes(search.toLowerCase()));

      const matchPriority =
        priorityFilter === 'all' || t.priority === priorityFilter;

      return matchSearch && matchPriority;
    });
  }, [tasks, search, priorityFilter]);

  // Group tasks by column status
  const tasksByColumn = useMemo(() => {
    const map = {
      todo: [],
      in_progress: [],
      review: [],
      completed: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.todo.push(t);
      }
    });

    // Ensure sorted by order
    Object.keys(map).forEach((col) => {
      map[col].sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    return map;
  }, [filteredTasks]);

  // Drag handlers
  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Moving task over another task in another column
    if (isActiveTask && isOverTask) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t._id === activeId);
        const overIndex = prevTasks.findIndex((t) => t._id === overId);

        if (prevTasks[activeIndex].status !== prevTasks[overIndex].status) {
          const updated = [...prevTasks];
          updated[activeIndex] = {
            ...updated[activeIndex],
            status: prevTasks[overIndex].status,
          };
          return arrayMove(updated, activeIndex, overIndex);
        }

        return arrayMove(prevTasks, activeIndex, overIndex);
      });
    }

    // Moving task over an empty column
    if (isActiveTask && isOverColumn) {
      setTasks((prevTasks) => {
        const activeIndex = prevTasks.findIndex((t) => t._id === activeId);
        if (prevTasks[activeIndex].status !== overId) {
          const updated = [...prevTasks];
          updated[activeIndex] = {
            ...updated[activeIndex],
            status: overId,
          };
          return arrayMove(updated, activeIndex, activeIndex);
        }
        return prevTasks;
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const task = tasks.find((t) => t._id === activeId);
    if (!task) return;

    // Find destination status and calculated order
    let targetStatus = task.status;
    let targetOrder = 0;

    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (isOverColumn) {
      targetStatus = overId;
    } else if (isOverTask) {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        targetOrder = overTask.order || 0;
      }
    }

    // Persist status change to backend
    const originalTasks = [...tasks];
    try {
      await taskService.updateTaskStatus(task._id, {
        status: targetStatus,
        order: targetOrder,
      });
    } catch (err) {
      // Revert optimistic update on failure
      error('Failed to sync Kanban update to server. Restoring previous state.');
      setTasks(originalTasks);
    }
  };

  const handleCardClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddTaskToColumn = (columnId) => {
    setTargetColumnForNew(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-6.5rem)] animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Kanban Board
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
              {filteredTasks.length} Work Items
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time drag & drop sprint execution board with optimistic sync.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setTargetColumnForNew('todo');
              setIsModalOpen(true);
            }}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#111827] p-3 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex-shrink-0">
        {/* Project Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FolderKanban className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter cards by title or label..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Priority Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Drag & Drop Canvas */}
      {loading ? (
        <Loader message="Loading Kanban lanes..." className="py-20" />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto min-h-0 pb-4">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={tasksByColumn[col.id] || []}
                onCardClick={handleCardClick}
                onAddTask={handleAddTaskToColumn}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSuccess={fetchTasks}
        task={editingTask}
        initialProjectId={selectedProject !== 'all' ? selectedProject : null}
        initialStatus={targetColumnForNew}
      />
    </div>
  );
};

export default KanbanPage;
