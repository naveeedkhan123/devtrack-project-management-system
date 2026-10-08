import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const ProjectModal = ({ isOpen, onClose, onSuccess, project = null }) => {
  const isEditing = !!project;
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    manager: '',
    members: [],
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        if (res?.data?.users) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error('Failed to load users for project modal:', err);
      }
    };

    if (isOpen) {
      fetchUsers();
      if (project) {
        setFormData({
          name: project.name || '',
          key: project.key || '',
          description: project.description || '',
          status: project.status || 'planning',
          priority: project.priority || 'medium',
          startDate: project.startDate
            ? new Date(project.startDate).toISOString().split('T')[0]
            : '',
          deadline: project.deadline
            ? new Date(project.deadline).toISOString().split('T')[0]
            : '',
          manager: project.manager?._id || project.manager || '',
          members: project.members?.map((m) => (m._id ? m._id : m)) || [],
        });
      } else {
        setFormData({
          name: '',
          key: '',
          description: '',
          status: 'planning',
          priority: 'medium',
          startDate: new Date().toISOString().split('T')[0],
          deadline: '',
          manager: '',
          members: [],
        });
      }
      setErrors({});
    }
  }, [isOpen, project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleMemberToggle = (userId) => {
    setFormData((prev) => {
      const exists = prev.members.includes(userId);
      const updated = exists
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members: updated };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Project name is required';
    if (!isEditing && !formData.key.trim()) {
      errs.key = 'Project key code is required (e.g. DEV)';
    }
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.manager) errs.manager = 'Please assign a project manager';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      if (isEditing) {
        await projectService.updateProject(project._id, formData);
        success('Project updated successfully');
      } else {
        await projectService.createProject(formData);
        success('Project created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const managerOptions = users
    .filter((u) => u.role === 'admin' || u.role === 'project_manager')
    .map((u) => ({
      value: u._id,
      label: `${u.name} (${u.role.replace('_', ' ')})`,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description="Configure project parameters, roadmap milestones, and assign members."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Project Name"
              name="name"
              placeholder="CloudScale Platform 2.0"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </div>
          <div>
            <Input
              label="Project Key (Unique)"
              name="key"
              placeholder="CSP"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, key: e.target.value.toUpperCase() }))
              }
              error={errors.key}
              disabled={isEditing}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed overview of technical scope and goals..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Project Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <Select
            label="Priority Level"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
          <Input
            label="Target Deadline"
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
          />
        </div>

        <Select
          label="Project Manager (Lead)"
          name="manager"
          placeholder="Select Project Manager..."
          value={formData.manager}
          onChange={handleChange}
          options={managerOptions}
          error={errors.manager}
          required
        />

        {/* Team Members Multi-select checkboxes */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Assign Team Members
          </label>
          <div className="max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 divide-y divide-gray-100 dark:divide-gray-800 space-y-1">
            {users.map((u) => (
              <label
                key={u._id}
                className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded cursor-pointer text-xs"
              >
                <input
                  type="checkbox"
                  checked={formData.members.includes(u._id)}
                  onChange={() => handleMemberToggle(u._id)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span className="font-medium text-gray-800 dark:text-gray-200">{u.name}</span>
                <span className="text-gray-400 capitalize">({u.role.replace('_', ' ')})</span>
              </label>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
