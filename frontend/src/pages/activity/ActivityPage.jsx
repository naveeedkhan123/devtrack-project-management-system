import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  FolderKanban,
  CheckSquare,
  Bug,
  MessageSquare,
  User,
} from 'lucide-react';
import { activityService } from '../../services/activityService';
import { projectService } from '../../services/projectService';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatRelativeTime } from '../../utils/dateUtils';

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getProjects({ limit: 100 });
        if (res?.data?.projects) setProjects(res.data.projects);
      } catch (err) {
        console.error('Failed to load projects for activity filter:', err);
      }
    };
    loadProjects();
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (projectFilter !== 'all') params.project = projectFilter;
      if (entityFilter !== 'all') params.entityType = entityFilter;

      const res = await activityService.getActivityLogs(params);
      if (res?.data?.activities) {
        setActivities(res.data.activities);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, [projectFilter, entityFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const getEntityIcon = (type) => {
    switch (type) {
      case 'project':
        return <FolderKanban className="w-4 h-4 text-brand-500" />;
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'bug':
        return <Bug className="w-4 h-4 text-rose-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'user':
        return <User className="w-4 h-4 text-amber-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Activity Logs & Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Real-time chronological telemetry across task updates, bug resolutions, and member additions.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              [{p.key}] {p.name}
            </option>
          ))}
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Event Types</option>
          <option value="project">Projects</option>
          <option value="task">Tasks</option>
          <option value="bug">Defects & Bugs</option>
          <option value="comment">Comments</option>
          <option value="user">User Events</option>
        </select>
      </div>

      {/* Activity Timeline */}
      {loading ? (
        <Loader message="Loading activity stream..." className="py-20" />
      ) : activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No events found"
          description="There are no activity events matching your current filters."
        />
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
            {activities.map((act) => (
              <div key={act._id} className="relative flex items-start gap-4">
                {/* Dot */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-[#111827] border-2 border-brand-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                </div>

                {/* Content */}
                <div className="flex-1 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/40 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        {getEntityIcon(act.entityType)}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {act.user?.name || 'System User'}
                      </span>
                      {act.project && (
                        <span className="font-mono text-[10px] font-bold text-brand-600 dark:text-brand-400">
                          [{act.project.key}]
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {formatRelativeTime(act.createdAt)}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {act.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityPage;
