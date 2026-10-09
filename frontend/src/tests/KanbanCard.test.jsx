import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import KanbanCard from '../components/kanban/KanbanCard';

// Mock dnd-kit hooks for pure component testing
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

describe('KanbanCard Component', () => {
  const mockTask = {
    _id: 'task-101',
    title: 'Implement OAuth Token Refresh',
    priority: 'critical',
    status: 'in_progress',
    labels: ['Security', 'Backend'],
    project: { key: 'AUTH' },
    assignedTo: { name: 'David Chen' },
    commentsCount: 3,
  };

  it('renders task card information accurately', () => {
    const handleClick = vi.fn();
    render(<KanbanCard task={mockTask} onClick={handleClick} />);

    expect(screen.getByText('Implement OAuth Token Refresh')).toBeInTheDocument();
    expect(screen.getByText('AUTH')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
