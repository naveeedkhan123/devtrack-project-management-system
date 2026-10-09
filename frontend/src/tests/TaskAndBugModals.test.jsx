import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskModal from '../components/tasks/TaskModal';
import BugModal from '../components/bugs/BugModal';
import { ToastProvider } from '../context/ToastContext';

// Mock project and user services
vi.mock('../services/projectService', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue({
      data: { projects: [{ _id: 'proj-1', key: 'DEV', name: 'DevTrack Core' }] },
    }),
  },
}));

vi.mock('../services/userService', () => ({
  userService: {
    getUsers: vi.fn().mockResolvedValue({
      data: { users: [{ _id: 'user-1', name: 'Alex Morgan', role: 'admin' }] },
    }),
  },
}));

describe('Task and Bug Modals Suite', () => {
  it('TaskModal renders all input fields and validation states', () => {
    render(
      <ToastProvider>
        <TaskModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      </ToastProvider>
    );

    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Column Status/i)).toBeInTheDocument();
  });

  it('BugModal renders defect fields including reproduction steps and environment', () => {
    render(
      <ToastProvider>
        <BugModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />
      </ToastProvider>
    );

    expect(screen.getByText('Report Software Defect')).toBeInTheDocument();
    expect(screen.getByLabelText(/Defect Summary \/ Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Environment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Steps to Reproduce/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Result/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Actual Result/i)).toBeInTheDocument();
  });
});
