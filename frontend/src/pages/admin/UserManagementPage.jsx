import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Search,
  Trash2,
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/dateUtils';
import { getInitials } from '../../utils/formatters';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await userService.getAdminUsers(params);
      if (res?.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load user management list');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userService.updateUserRole(userId, newRole);
      success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      success(`User account status updated`);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await userService.deleteUser(userToDelete._id);
      success('User deleted successfully');
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-rose-500" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Admin User Management
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Assign RBAC security roles, activate or suspend team access, and audit accounts.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="project_manager">Project Manager</option>
            <option value="developer">Developer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader message="Loading accounts..." className="py-20" />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No users found"
          description="Try broadening your search query."
        />
      ) : (
        <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 dark:bg-gray-900/60 uppercase text-[10px] font-bold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Assigned Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {users.map((item) => {
                  const isSelf = item._id === currentUser?._id;
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              onError={(event) => { event.currentTarget.style.display = 'none'; }}
                              className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center">
                              {getInitials(item.name)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 dark:text-gray-100 block">
                              {item.name} {isSelf && '(You)'}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <select
                          value={item.role}
                          disabled={isSelf}
                          onChange={(e) => handleRoleChange(item._id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
                        >
                          <option value="developer">Developer</option>
                          <option value="project_manager">Project Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {item.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            disabled={isSelf}
                            onClick={() => handleToggleStatus(item._id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              item.status === 'active'
                                ? 'border-amber-500/30 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            } disabled:opacity-40 disabled:cursor-not-allowed`}
                            title={isSelf ? 'Cannot modify self' : 'Toggle status'}
                          >
                            {item.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            disabled={isSelf}
                            onClick={() => setUserToDelete(item)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User Account?"
        message={`Are you sure you want to permanently delete user "${userToDelete?.name}" (${userToDelete?.email})?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserManagementPage;
