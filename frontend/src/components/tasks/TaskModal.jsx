import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const TaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  task = null,
  initialProjectId = null,
  initialStatus = 'todo',
}) => {
  const isEditing = !!task;
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: initialProjectId || '',
    priority: 'medium',
    status: initialStatus,
    assignedTo: '',
    dueDate: '',
    labelsString: '',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          projectService.getProjects({ limit: 100 }),
          userService.getUsers(),
        ]);
        if (projRes?.data?.projects) setProjects(projRes.data.projects);
        if (userRes?.data?.users) setUsers(userRes.data.users);
      } catch (err) {
        console.error('Failed to load dependency data for task modal:', err);
      }
    };

    if (isOpen) {
      fetchData();
      if (task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          project: task.project?._id || task.project || initialProjectId || '',
          priority: task.priority || 'medium',
          status: task.status || initialStatus,
          assignedTo: task.assignedTo?._id || task.assignedTo || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          labelsString: task.labels ? task.labels.join(', ') : '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          project: initialProjectId || '',
          priority: 'medium',
          status: initialStatus,
          assignedTo: '',
          dueDate: '',
          labelsString: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, task, initialProjectId, initialStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Task title is required';
    if (!formData.project) errs.project = 'Project assignment is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const labels = formData.labelsString
        ? formData.labelsString
            .split(',')
            .map((l) => l.trim())
            .filter(Boolean)
        : [];

      const payload = {
        title: formData.title,
        description: formData.description,
        project: formData.project,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo || null,
        dueDate: formData.dueDate || null,
        labels,
      };

      if (isEditing) {
        await taskService.updateTask(task._id, payload);
        success('Task updated successfully');
      } else {
        await taskService.createTask(payload);
        success('Task created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  const statusOptions = [
    { value: 'todo', label: 'TODO' },
    { value: 'in_progress', label: 'IN PROGRESS' },
    { value: 'review', label: 'REVIEW' },
    { value: 'completed', label: 'COMPLETED' },
  ];

  const projectOptions = projects.map((p) => ({
    value: p._id,
    label: `[${p.key}] ${p.name}`,
  }));

  const userOptions = users.map((u) => ({
    value: u._id,
    label: `${u.name} (${u.role.replace('_', ' ')})`,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEditing ? 'Edit Task' : 'Create New Task'}
      description="Define work item requirements, estimates, and assign to team members."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          name="title"
          placeholder="e.g. Implement OAuth2 login flow"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <Select
          label="Project"
          name="project"
          placeholder="Select Project..."
          value={formData.project}
          onChange={handleChange}
          options={projectOptions}
          error={errors.project}
          disabled={!!initialProjectId && !isEditing}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Technical details, ACs, and acceptance criteria..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
          />
          <Select
            label="Column Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Assignee"
            name="assignedTo"
            placeholder="Unassigned"
            value={formData.assignedTo}
            onChange={handleChange}
            options={userOptions}
          />
          <Input
            label="Due Date"
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Labels (Comma-separated)"
          name="labelsString"
          placeholder="Frontend, Security, Sprint-4"
          value={formData.labelsString}
          onChange={handleChange}
          helperText="Separate multiple labels with commas"
        />
      </form>
    </Modal>
  );
};

export default TaskModal;
