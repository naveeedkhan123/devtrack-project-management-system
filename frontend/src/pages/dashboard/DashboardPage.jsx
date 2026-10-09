import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Bug,
  TrendingUp,
  Calendar,
  ArrowRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatDate, formatRelativeTime, isOverdue } from '../../utils/dateUtils';
import { formatStatus, getInitials } from '../../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getStats();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader message="Loading dashboard telemetry..." className="py-20" />;
  }

  const kpi = data?.kpi || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];
  const upcomingTasks = data?.upcomingTasks || [];

  // Colors for Recharts
  const STATUS_COLORS = {
    todo: '#6B7280',
    in_progress: '#3B82F6',
    review: '#8B5CF6',
    completed: '#10B981',
  };

  const SEVERITY_COLORS = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#B91C1C',
  };

  const tasksStatusData = (charts.tasksByStatus || []).map((item) => ({
    name: formatStatus(item._id),
    count: item.count,
    fill: STATUS_COLORS[item._id] || '#3B82F6',
  }));

  const bugsSeverityData = (charts.bugsBySeverity || []).map((item) => ({
    name: formatStatus(item._id),
    value: item.count,
    color: SEVERITY_COLORS[item._id] || '#EF4444',
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 text-white shadow-xl shadow-brand-500/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/20 tracking-wider">
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
            Here is your live engineering overview across projects, sprint execution, and active defects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/kanban">
            <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0">
              Go to Kanban
            </Button>
          </Link>
          <Link to="/tasks">
            <Button variant="secondary" size="sm" className="bg-white text-brand-700 hover:bg-gray-100 border-0 font-semibold shadow-sm">
              View All Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects KPI */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kpi.totalProjects || 0}
            </span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="text-emerald-500 font-semibold">{kpi.activeProjects || 0} Active</span>
            <span>•</span>
            <span>{kpi.completedProjects || 0} Completed</span>
          </div>
        </Card>

        {/* Tasks KPI */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kpi.totalTasks || 0}
            </span>
            <span className="text-xs text-gray-400">Total</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="text-emerald-500 font-semibold">{kpi.completedTasks || 0} Done</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">{kpi.pendingTasks || 0} Pending</span>
          </div>
        </Card>

        {/* Bugs KPI */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Defects & Bugs
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Bug className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {kpi.openBugs || 0}
            </span>
            <span className="text-xs text-gray-400">Open</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <span className="text-emerald-500 font-semibold">{kpi.resolvedBugs || 0} Resolved</span>
          </div>
        </Card>

        {/* Completion Rate KPI */}
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Sprint Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {kpi.totalTasks > 0
                ? Math.round((kpi.completedTasks / kpi.totalTasks) * 100)
                : 0}
              %
            </span>
            <span className="text-xs text-gray-400">Completion</span>
          </div>
          <div className="mt-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${
                  kpi.totalTasks > 0
                    ? Math.round((kpi.completedTasks / kpi.totalTasks) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </Card>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksStatusData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                No task data recorded yet
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tasksStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#9CA3AF', fontSize: 11 }}
                      axisLine={{ stroke: '#374151' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#F9FAFB',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bug Severity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Bug Breakdown by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            {bugsSeverityData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                No bugs reported in active projects
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bugsSeverityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {bugsSeverityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#F9FAFB',
                      }}
                      labelStyle={{ color: '#FFFFFF' }}
                      itemStyle={{ color: '#FFFFFF' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span className="text-xs text-gray-600 dark:text-gray-300 mr-2">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Overview */}
      {charts.projectProgress && charts.projectProgress.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Active Projects & Velocity</CardTitle>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {charts.projectProgress.map((proj) => (
                <Link
                  key={proj.id}
                  to={`/projects/${proj.id}`}
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 hover:border-brand-500/50 transition-colors block"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      {proj.key}
                    </span>
                    <Badge type="status" variant={proj.status} size="xs" />
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate mb-3">
                    {proj.name}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>{proj.completedTasks} / {proj.totalTasks} Tasks</span>
                      <span className="font-semibold">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid: Upcoming Deadlines & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Deadlines
            </CardTitle>
            <Link
              to="/tasks"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Tasks
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No approaching deadlines found
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {upcomingTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  return (
                    <div
                      key={task._id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-xs font-semibold text-gray-900 dark:text-gray-100 hover:text-brand-500 dark:hover:text-brand-400 truncate block"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                          <span className="font-medium text-brand-500">[{task.project?.key}]</span>
                          <span>•</span>
                          <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${
                            overdue
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Recent Team Activity
            </CardTitle>
            <Link
              to="/activity"
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
            >
              Full Stream
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No recent activity recorded
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentActivity.map((act) => (
                  <div
                    key={act._id}
                    className="p-3.5 flex items-start gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getInitials(act.user?.name)}
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="text-gray-800 dark:text-gray-200 leading-snug">
                        {act.details}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatRelativeTime(act.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
