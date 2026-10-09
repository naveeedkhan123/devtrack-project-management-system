import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Bug,
  Users,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  ArrowLeft,
  Kanban,
} from 'lucide-react';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Select from '../../components/common/Select';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProjectModal from '../../components/projects/ProjectModal';
import TaskModal from '../../components/tasks/TaskModal';
import BugModal from '../../components/bugs/BugModal';
import { formatDate } from '../../utils/dateUtils';
import { getInitials } from '../../utils/formatters';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProject(id);
      if (res?.data) {
        setProject(res.data.project);
        setTasks(res.data.tasks || []);
        setBugs(res.data.bugs || []);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, error]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Load available users for Add Member dialog
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res?.data?.users) {
          setAvailableUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load users for roster modal:', err);
      }
    };
    if (isAddMemberModalOpen) {
      loadUsers();
    }
  }, [isAddMemberModalOpen]);

  const handleDeleteProject = async () => {
    try {
      setActionLoading(true);
      await projectService.deleteProject(id);
      success('Project deleted successfully');
      navigate('/projects');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setActionLoading(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedNewMember) return;
    try {
      setActionLoading(true);
      await projectService.addMember(id, selectedNewMember);
      success('Member added to project team');
      setIsAddMemberModalOpen(false);
      setSelectedNewMember('');
      fetchProjectDetails();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await projectService.removeMember(id, memberId);
      success('Member removed from project');
      fetchProjectDetails();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return <Loader message="Loading project workspace..." className="py-20" />;
  }

  if (!project) return null;

  const metrics = project.metrics || {};
  const currentMembers = project.members || [];
  const nonMembers = availableUsers.filter(
    (u) => !currentMembers.some((m) => m._id === u._id)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button & top bar */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link
          to="/projects"
          className="hover:text-brand-500 flex items-center gap-1 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Projects
        </Link>
        <span>/</span>
        <span className="font-mono text-brand-500">[{project.key}]</span>
        <span className="truncate">{project.name}</span>
      </div>

      {/* Project Banner Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-sm font-bold px-2.5 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              {project.key}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              {project.name}
            </h1>
            <Badge type="status" variant={project.status} size="sm" />
            <Badge type="priority" variant={project.priority} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <Link to={`/kanban?project=${project._id}`}>
            <Button variant="secondary" size="sm" icon={Kanban}>
              Kanban Board
            </Button>
          </Link>

          {(isManager || isAdmin) && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview & Velocity', icon: FolderKanban },
          { key: 'tasks', label: `Tasks (${tasks.length})`, icon: CheckSquare },
          { key: 'bugs', label: `Bugs (${bugs.length})`, icon: Bug },
          { key: 'team', label: `Team (${currentMembers.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 flex items-center gap-2 transition-colors relative ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                Sprint Progress
              </span>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {metrics.progress || 0}%
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                <div
                  className="bg-brand-500 h-1.5 rounded-full"
                  style={{ width: `${metrics.progress || 0}%` }}
                />
              </div>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                Completed Tasks
              </span>
              <div className="text-2xl font-bold text-emerald-500 mt-1">
                {metrics.completedTasks || 0} / {metrics.totalTasks || 0}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                {metrics.totalTasks - metrics.completedTasks} remaining
              </span>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                Open Defects
              </span>
              <div className="text-2xl font-bold text-rose-500 mt-1">
                {metrics.openBugs || 0}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Active defect reports</span>
            </Card>

            <Card className="p-4">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                Delivery Deadline
              </span>
              <div className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-1 truncate">
                {formatDate(project.deadline)}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                Started: {formatDate(project.startDate)}
              </span>
            </Card>
          </div>

          {/* Manager & Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Assigned Project Manager</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-base flex items-center justify-center">
                  {getInitials(project.manager?.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {project.manager?.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {project.manager?.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                    {project.manager?.role?.replace('_', ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Jump</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  to={`/kanban?project=${project._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Kanban className="w-4 h-4 text-brand-500" />
                    Open Kanban Board for {project.key}
                  </span>
                  <span>→</span>
                </Link>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 hover:bg-brand-50 dark:hover:bg-brand-950/20 text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    Create New Task in this Project
                  </span>
                  <span>+</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab Content: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Work Items & Sprint Backlog
            </h3>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsTaskModalOpen(true)}
            >
              Add Task
            </Button>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              No tasks created for this project yet. Click "Add Task" to create one.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-brand-500 transition-colors truncate"
                      >
                        {task.title}
                      </Link>
                      <Badge type="status" variant={task.status} size="xs" />
                      <Badge type="priority" variant={task.priority} size="xs" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Assignee: {task.assignedTo?.name || 'Unassigned'}</span>
                      <span>•</span>
                      <span>Due: {formatDate(task.dueDate)}</span>
                      {task.labels?.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate">{task.labels.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to={`/tasks/${task._id}`}>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: BUGS */}
      {activeTab === 'bugs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Defects & Bugs
            </h3>
            <Button
              variant="danger"
              size="sm"
              icon={Plus}
              onClick={() => setIsBugModalOpen(true)}
            >
              Report Bug
            </Button>
          </div>

          {bugs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              Zero defects logged for this project!
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
              {bugs.map((bug) => (
                <div
                  key={bug._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        to={`/bugs/${bug._id}`}
                        className="text-xs font-bold text-gray-900 dark:text-gray-100 hover:text-rose-500 transition-colors truncate"
                      >
                        {bug.title}
                      </Link>
                      <Badge type="severity" variant={bug.severity} size="xs" />
                      <Badge type="status" variant={bug.status} size="xs" />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      <span>Reported by: {bug.reportedBy?.name}</span>
                      <span>•</span>
                      <span>Assignee: {bug.assignedTo?.name || 'Unassigned'}</span>
                      <span>•</span>
                      <span>Env: {bug.environment}</span>
                    </div>
                  </div>
                  <Link to={`/bugs/${bug._id}`}>
                    <Button variant="ghost" size="sm">
                      Inspect
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: TEAM ROSTER */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Assigned Team Members ({currentMembers.length})
            </h3>
            {(isManager || isAdmin) && (
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setIsAddMemberModalOpen(true)}
              >
                Add Member
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMembers.map((member) => {
              const isLead = member._id === project.manager?._id;
              return (
                <Card key={member._id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                      {getInitials(member.name)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                        {member.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">{member.email}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-semibold uppercase text-brand-500">
                          {member.role?.replace('_', ' ')}
                        </span>
                        {isLead && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 font-bold">
                            LEAD
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {(isManager || isAdmin) && !isLead && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-gray-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      title="Remove member from project"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchProjectDetails}
        project={project}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchProjectDetails}
        initialProjectId={project._id}
      />

      {/* Bug Modal */}
      <BugModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        onSuccess={fetchProjectDetails}
        initialProjectId={project._id}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member to Project"
        description="Select an engineer to grant access to this project workspace."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddMemberModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddMember}
              isLoading={actionLoading}
              disabled={!selectedNewMember}
            >
              Add Engineer
            </Button>
          </>
        }
      >
        <Select
          label="Select Engineer"
          value={selectedNewMember}
          onChange={(e) => setSelectedNewMember(e.target.value)}
          placeholder="Choose user from directory..."
          options={nonMembers.map((u) => ({
            value: u._id,
            label: `${u.name} (${u.email}) - ${u.role.replace('_', ' ')}`,
          }))}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteProject}
        title={`Delete Project [${project.key}]?`}
        message="This action will permanently delete this project, all associated sprint tasks, and reported bugs. This operation cannot be reversed."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ProjectDetailsPage;
