import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  Clock,
  Shield,
  Users,
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const SystemOverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getSystemOverview();
        if (res?.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load system overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return <Loader message="Analyzing system health & runtime telemetry..." className="py-20" />;
  }

  const system = data?.systemInfo || {};
  const stats = data?.stats || {};
  const roles = stats.roleBreakdown || {};
  const entities = stats.entities || {};

  const formatUptime = (seconds) => {
    if (!seconds) return '0m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-500" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            System & Infrastructure Health
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Live server runtime telemetry, MongoDB connection status, and entity storage counts.
        </p>
      </div>

      {/* Runtime Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">
              Database State
            </span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-base font-bold text-gray-900 dark:text-gray-100">
              {system.databaseState || 'Connected'}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">Mongoose ODM Active</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">
              Server Uptime
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">
            {formatUptime(system.uptimeSeconds)}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">Process uninterrupted</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">
              Memory Usage
            </span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">
            {system.memoryUsageMb || 0} MB
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block">Node Heap Allocated</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase">
              Node Runtime
            </span>
            <Server className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100 block">
            {system.nodeVersion || 'v20+'}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 block capitalize">
            Platform: {system.platform}
          </span>
        </Card>
      </div>

      {/* Entity Storage Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Database Entity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 block">
                {stats.totalUsers || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Registered Users</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400 block">
                {entities.totalProjects || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Projects</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-emerald-500 block">
                {entities.totalTasks || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Tasks</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-rose-500 block">
                {entities.totalBugs || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Defects & Bugs</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-purple-500 block">
                {entities.totalComments || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Comments</span>
            </div>

            <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800">
              <span className="text-xl font-extrabold text-amber-500 block">
                {entities.totalActivityLogs || 0}
              </span>
              <span className="text-[11px] text-gray-500 font-medium">Activity Logs</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Breakdown Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Role Security Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/60 dark:bg-gray-900/30 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  System Administrators
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {roles.admins || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/60 dark:bg-gray-900/30 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Project Managers (Lead)
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {roles.projectManagers || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50/60 dark:bg-gray-900/30 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  Software Developers
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {roles.developers || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Status Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">Active User Ratio</span>
              <span className="font-bold text-emerald-500">
                {stats.userStatus?.activeUsers || 0} Active /{' '}
                {stats.userStatus?.inactiveUsers || 0} Suspended
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{
                  width: `${
                    stats.totalUsers > 0
                      ? Math.round(
                          ((stats.userStatus?.activeUsers || 0) / stats.totalUsers) * 100
                        )
                      : 100
                  }%`,
                }}
              />
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed pt-2">
              All REST API endpoints are protected with rate limiting, Helmet HTTP headers, and Bearer JWT signature verification.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemOverviewPage;
