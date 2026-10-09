import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Bug,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { bugService } from '../../services/bugService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import BugModal from '../../components/bugs/BugModal';
import { getInitials } from '../../utils/formatters';

const BugsPage = () => {
  const { isManager, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBug, setEditingBug] = useState(null);
  const [bugToDelete, setBugToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, projectFilter, statusFilter, severityFilter, priorityFilter, assigneeFilter]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          projectService.getProjects({ limit: 100 }),
          userService.getUsers(),
        ]);
        if (projRes?.data?.projects) setProjects(projRes.data.projects);
        if (userRes?.data?.users) setUsers(userRes.data.users);
      } catch (err) {
        console.error('Failed to load metadata for bugs filter:', err);
      }
    };
    loadMetadata();
  }, []);

  const fetchBugs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      params.page = page;
      params.limit = 25;
      if (search) params.search = search;
      if (projectFilter !== 'all') params.project = projectFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (assigneeFilter !== 'all') params.assignedTo = assigneeFilter;

      const res = await bugService.getBugs(params);
      if (res?.data?.bugs) {
        setBugs(res.data.bugs);
        setPagination(res.data.pagination || { page, limit: 25, total: res.data.total, pages: 1 });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch bug reports');
    } finally {
      setLoading(false);
    }
  }, [
    search,
    projectFilter,
    statusFilter,
    severityFilter,
    priorityFilter,
    assigneeFilter,
    page,
    error,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBugs();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchBugs]);

  const handleDelete = async () => {
    if (!bugToDelete) return;
    try {
      setIsDeleting(true);
      await bugService.deleteBug(bugToDelete._id);
      success('Bug report deleted');
      setBugToDelete(null);
      fetchBugs();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete bug report');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Defect & Bug Tracking
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Log, classify, and resolve bugs across production and test environments.
          </p>
        </div>

        <Button
          variant="danger"
          size="sm"
          icon={Plus}
          onClick={() => {
            setEditingBug(null);
            setIsModalOpen(true);
          }}
        >
          Report Bug
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search bugs by summary, description, environment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                [{p.key}] {p.name}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="reopened">Reopened</option>
          </select>

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

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bugs Table */}
      {loading ? (
        <Loader message="Loading bug reports..." className="py-20" />
      ) : bugs.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No defects reported"
          description="Everything is running smoothly or no bugs matched your current filter criteria."
          actionLabel="Report Defect"
          onAction={() => {
            setEditingBug(null);
            setIsModalOpen(true);
          }}
          actionIcon={Plus}
        />
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 uppercase text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Defect Title</th>
                  <th className="px-4 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Severity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Environment</th>
                  <th className="px-4 py-3.5">Assignee</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {bugs.map((bug) => (
                  <tr
                    key={bug._id}
                    className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3.5 max-w-xs">
                      <Link
                        to={`/bugs/${bug._id}`}
                        className="font-semibold text-gray-900 dark:text-gray-100 hover:text-rose-500 transition-colors line-clamp-1"
                      >
                        {bug.title}
                      </Link>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Reported by {bug.reportedBy?.name || 'User'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {bug.project?.key || 'PRJ'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge type="severity" variant={bug.severity} size="xs" />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge type="status" variant={bug.status} size="xs" />
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      {bug.environment || 'Production'}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {bug.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[9px] flex items-center justify-center">
                            {getInitials(bug.assignedTo.name)}
                          </div>
                          <span className="text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                            {bug.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/bugs/${bug._id}`}>
                          <button
                            className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Inspect defect"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </Link>

                        {(isManager || isAdmin) && (
                          <>
                            <button
                              onClick={() => {
                                setEditingBug(bug);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              title="Edit bug"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setBugToDelete(bug)}
                              className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              title="Delete bug"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination {...pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Bug Modal */}
      <BugModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBug(null);
        }}
        onSuccess={fetchBugs}
        bug={editingBug}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!bugToDelete}
        onClose={() => setBugToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Defect Report?"
        message={`Are you sure you want to delete "${bugToDelete?.title}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default BugsPage;
