import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  CheckSquare,
  Bug,
  ArrowRight,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import ProjectModal from '../../components/projects/ProjectModal';
import { getInitials } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

const ProjectsPage = () => {
  const { isManager, isAdmin } = useAuth();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 0 });
  const [search, setSearch] = useState(() => new URLSearchParams(location.search).get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { error } = useToast();

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 25 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;

      const res = await projectService.getProjects(params);
      if (res?.data?.projects) {
        setProjects(res.data.projects);
        setPagination(res.data.pagination || { page, limit: 25, total: res.data.total, pages: 1 });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Software Projects
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage agile engineering repositories, sprint roadmaps, and delivery milestones.
          </p>
        </div>

        {(isManager || isAdmin) && (
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="shadow-sm shadow-brand-500/20"
          >
            Create Project
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by project name, key or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
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
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <Loader message="Loading projects..." className="py-20" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match criteria"
          description="Try broadening your search filters or create a new software development project."
          actionLabel={isManager || isAdmin ? 'Create Project' : null}
          onAction={() => setIsModalOpen(true)}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const metrics = project.metrics || {};
            return (
              <Card
                key={project._id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div className="p-5">
                  {/* Key & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {project.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge type="priority" variant={project.priority} size="xs" />
                      <Badge type="status" variant={project.status} size="xs" />
                    </div>
                  </div>

                  {/* Name & Description */}
                  <Link
                    to={`/projects/${project._id}`}
                    className="block group"
                  >
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-brand-500 transition-colors line-clamp-1 mb-1">
                      {project.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>Sprint Progress</span>
                      <span className="font-semibold">{metrics.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${metrics.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Task & Bug Mini Counters */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-gray-50/70 dark:bg-gray-900/40 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-300 text-[11px]">
                        {metrics.completedTasks || 0} / {metrics.totalTasks || 0} Tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bug className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-gray-600 dark:text-gray-300 text-[11px]">
                        {metrics.openBugs || 0} Open Bugs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with Lead & Members */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/40 dark:bg-gray-900/20 flex items-center justify-between text-xs">
                  {/* Lead Manager */}
                  <div className="flex items-center gap-2" title={`Manager: ${project.manager?.name}`}>
                    <div className="w-6 h-6 rounded-md bg-brand-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {getInitials(project.manager?.name)}
                    </div>
                    <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[100px]">
                      {project.manager?.name}
                    </span>
                  </div>

                  {/* View Details Link */}
                  <Link
                    to={`/projects/${project._id}`}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {!loading && projects.length > 0 && (
        <Pagination {...pagination} onPageChange={setPage} />
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default ProjectsPage;
