import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { bugService } from '../../services/bugService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';

const BugModal = ({
  isOpen,
  onClose,
  onSuccess,
  bug = null,
  initialProjectId = null,
}) => {
  const isEditing = !!bug;
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: initialProjectId || '',
    severity: 'medium',
    priority: 'medium',
    status: 'open',
    assignedTo: '',
    environment: 'Production',
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
    resolutionNotes: '',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          projectService.getProjects(),
          userService.getUsers(),
        ]);
        if (projRes?.data?.projects) setProjects(projRes.data.projects);
        if (userRes?.data?.users) setUsers(userRes.data.users);
      } catch (err) {
        console.error('Failed to load dependency data for bug modal:', err);
      }
    };

    if (isOpen) {
      fetchData();
      if (bug) {
        setFormData({
          title: bug.title || '',
          description: bug.description || '',
          project: bug.project?._id || bug.project || initialProjectId || '',
          severity: bug.severity || 'medium',
          priority: bug.priority || 'medium',
          status: bug.status || 'open',
          assignedTo: bug.assignedTo?._id || bug.assignedTo || '',
          environment: bug.environment || 'Production',
          stepsToReproduce: bug.stepsToReproduce || '',
          expectedResult: bug.expectedResult || '',
          actualResult: bug.actualResult || '',
          resolutionNotes: bug.resolutionNotes || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          project: initialProjectId || '',
          severity: 'medium',
          priority: 'medium',
          status: 'open',
          assignedTo: '',
          environment: 'Production',
          stepsToReproduce: '',
          expectedResult: '',
          actualResult: '',
          resolutionNotes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, bug, initialProjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Bug title is required';
    if (!formData.description.trim()) errs.description = 'Bug description is required';
    if (!formData.project) errs.project = 'Project selection is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        assignedTo: formData.assignedTo || null,
      };

      if (isEditing) {
        await bugService.updateBug(bug._id, payload);
        success('Bug report updated successfully');
      } else {
        await bugService.createBug(payload);
        success('Bug reported successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit bug report');
    } finally {
      setLoading(false);
    }
  };

  const severityOptions = [
    { value: 'critical', label: 'Critical (Outage / Blocker)' },
    { value: 'high', label: 'High (Major malfunction)' },
    { value: 'medium', label: 'Medium (Normal defect)' },
    { value: 'low', label: 'Low (Minor cosmetic issue)' },
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'reopened', label: 'Reopened' },
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
      size="lg"
      title={isEditing ? 'Edit Bug Report' : 'Report Software Defect'}
      description="Document steps to reproduce, severity, environment, and impact."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleSubmit} isLoading={loading}>
            {isEditing ? 'Save Changes' : 'Submit Bug Report'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Defect Summary / Title"
          name="title"
          placeholder="e.g. Memory leak in WebSocket connection listener"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Input
            label="Environment"
            name="environment"
            placeholder="Production, Staging, Safari 17, iOS 18"
            value={formData.environment}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue symptoms and impact..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            options={severityOptions}
          />
          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

        <Select
          label="Assigned Developer"
          name="assignedTo"
          placeholder="Unassigned"
          value={formData.assignedTo}
          onChange={handleChange}
          options={userOptions}
        />

        <div>
          <label htmlFor="stepsToReproduce" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Steps to Reproduce
          </label>
          <textarea
            id="stepsToReproduce"
            name="stepsToReproduce"
            rows="3"
            value={formData.stepsToReproduce}
            onChange={handleChange}
            placeholder="1. Navigate to...\n2. Click on...\n3. Observe..."
            className="w-full font-mono text-xs rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="expectedResult" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Expected Result
            </label>
            <textarea
              id="expectedResult"
              name="expectedResult"
              rows="2"
              value={formData.expectedResult}
              onChange={handleChange}
              placeholder="What should happen..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
          <div>
            <label htmlFor="actualResult" className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Actual Result
            </label>
            <textarea
              id="actualResult"
              name="actualResult"
              rows="2"
              value={formData.actualResult}
              onChange={handleChange}
              placeholder="What actually happens..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        </div>

        {isEditing && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Resolution Notes / Root Cause Analysis
            </label>
            <textarea
              name="resolutionNotes"
              rows="2"
              value={formData.resolutionNotes}
              onChange={handleChange}
              placeholder="Document the patch, PR link, or root cause explanation..."
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        )}
      </form>
    </Modal>
  );
};

export default BugModal;
