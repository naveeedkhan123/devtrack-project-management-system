import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LoginPage from '../pages/auth/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';

const renderLogin = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <LoginPage />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('LoginPage Component', () => {
  it('renders login form and demo accounts banner', () => {
    renderLogin();

    expect(screen.getByText('Sign in to your workspace')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Quick-Fill Demo Profiles/i)).toBeInTheDocument();
  });

  it('quick-fills Admin credentials when Admin button is clicked', () => {
    renderLogin();

    const adminBtn = screen.getByRole('button', { name: /Admin/i });
    fireEvent.click(adminBtn);

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput.value).toBe('admin@devtrack.io');
  });

  it('displays validation error if email is omitted on submit', async () => {
    const { container } = renderLogin();

    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(await screen.findByText(/Email address is required/i)).toBeInTheDocument();
  });
});
