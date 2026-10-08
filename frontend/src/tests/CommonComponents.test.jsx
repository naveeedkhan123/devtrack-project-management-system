import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

describe('Reusable Common Components Suite', () => {
  it('Button renders text and responds to click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Create Task</Button>);

    const btn = screen.getByRole('button', { name: /Create Task/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Badge renders correct text and status variant', () => {
    render(<Badge type="status" variant="in_progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('Input renders label, placeholder, and error states', () => {
    render(
      <Input
        label="Bug Title"
        placeholder="Enter summary..."
        error="Field is required"
      />
    );

    expect(screen.getByText('Bug Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter summary...')).toBeInTheDocument();
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('Modal renders title and handles close button click', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Sprint Planning">
        <p>Modal body content</p>
      </Modal>
    );

    expect(screen.getByText('Sprint Planning')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
