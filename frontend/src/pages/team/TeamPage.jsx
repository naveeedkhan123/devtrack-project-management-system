import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  CheckSquare,
  Bug,
  FolderKanban,
  Shield,
  Code,
  UserCheck,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { getInitials } from '../../utils/formatters';

const TeamPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await userService.getUsers();
        if (res?.data?.users) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load team roster:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.bio?.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Engineering Team Directory
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Workload telemetry, assigned responsibilities, and active sprint assignments.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search team member by name, email or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="project_manager">Project Managers</option>
          <option value="developer">Developers</option>
        </select>
      </div>

      {/* Team Roster Grid */}
      {loading ? (
        <Loader message="Loading team directory..." className="py-20" />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="Try modifying your search or role filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((member) => {
            const stats = member.stats || {};
            return (
              <Card key={member._id} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  {/* Top: Avatar, Name, Email, Role */}
                  <div className="flex items-start gap-3.5 mb-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                        {getInitials(member.name)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        {member.email}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                        {member.role?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                      {member.bio}
                    </p>
                  )}
                </div>

                {/* Workload Metric Counters */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800/80 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 dark:text-gray-100 block">
                        {stats.completedTasks || 0} / {stats.assignedTasks || 0}
                      </span>
                      <span className="text-[10px] text-gray-400">Tasks Completed</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-rose-600 dark:text-rose-400 block">
                        {stats.openBugs || 0}
                      </span>
                      <span className="text-[10px] text-gray-400">Open Bugs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <FolderKanban className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-[11px] text-gray-600 dark:text-gray-300">
                      Active in <span className="font-bold text-gray-900 dark:text-gray-100">{stats.currentProjects || 0}</span> Projects
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeamPage;
