import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  FolderKanban,
} from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TaskModal from '../../components/tasks/TaskModal';
import CommentThread from '../../components/comments/CommentThread';
import { formatDate, formatRelativeTime, isOverdue } from '../../utils/dateUtils';
import { formatStatus, getInitials } from '../../utils/formatters';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTask(id);
      if (res?.data?.task) {
        setTask(res.data.task);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load task details');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, error]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await taskService.updateTaskStatus(task._id, { status: newStatus });
      setTask((prev) => ({ ...prev, status: newStatus }));
      success(`Task status moved to ${formatStatus(newStatus)}`);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await taskService.deleteTask(task._id);
      success('Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setActionLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (loading) {
    return <Loader message="Loading task details..." className="py-20" />;
  }

  if (!task) return null;

  const overdue = isOverdue(task.dueDate, task.status);
  const canEdit = isManager || isAdmin ||
    task.project?.manager?.toString() === user?._id?.toString() ||
    task.project?.members?.some((member) => member.toString() === user?._id?.toString());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link
          to="/tasks"
          className="hover:text-brand-500 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Tasks
        </Link>
        <span>/</span>
        <span className="font-mono text-brand-500">[{task.project?.key}]</span>
        <span className="truncate">{task.title}</span>
      </div>

      {/* Task Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {task.project?.key}
            </span>
            <Badge type="priority" variant={task.priority} size="sm" />
            <span className="text-xs text-gray-400">
              Created {formatRelativeTime(task.createdAt)}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            {task.title}
          </h1>
        </div>

        {/* Status Dropdown & Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">Status:</span>
            <select
              value={task.status}
              onChange={handleStatusChange}
              disabled={!canEdit}
              aria-label="Task status"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="todo">TODO</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="completed">COMPLETED</option>
            </select>
          </div>

          {(isManager || isAdmin) && (
            <>
              <Button
                variant="outline"
                size="sm"
                icon={Edit}
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setIsDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Task Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No description provided.</p>
              )}
            </CardContent>
          </Card>

          {/* Discussion */}
          <Card className="p-6">
            <CommentThread entityType="task" entityId={task._id} />
          </Card>
        </div>

        {/* Right 1 Col: Metadata Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Metadata & Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {/* Project */}
              <div>
                <span className="text-gray-400 block mb-1">Project</span>
                <Link
                  to={`/projects/${task.project?._id}`}
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  [{task.project?.key}] {task.project?.name}
                </Link>
              </div>

              {/* Assignee */}
              <div>
                <span className="text-gray-400 block mb-1">Assigned Developer</span>
                {task.assignedTo ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[10px] flex items-center justify-center">
                      {getInitials(task.assignedTo.name)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {task.assignedTo.name}
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        {task.assignedTo.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Unassigned</span>
                )}
              </div>

              {/* Creator */}
              <div>
                <span className="text-gray-400 block mb-1">Created By</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {task.createdBy?.name || 'System'}
                </span>
              </div>

              {/* Due Date */}
              <div>
                <span className="text-gray-400 block mb-1">Due Date</span>
                <span
                  className={`flex items-center gap-1.5 font-medium ${
                    overdue
                      ? 'text-rose-500 font-bold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(task.dueDate)}
                  {overdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
                </span>
              </div>

              {/* Labels */}
              {task.labels && task.labels.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-1">Labels</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.labels.map((lbl, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300 font-medium"
                      >
                        {lbl}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchTaskDetails}
        task={task}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"?`}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default TaskDetailsPage;
