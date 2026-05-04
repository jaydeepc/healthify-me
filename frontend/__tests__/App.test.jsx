import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../src/App';

// Mock React Router to avoid routing issues in tests
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
  Routes: ({ children }) => <div data-testid="routes">{children}</div>,
  Route: ({ element }) => <div data-testid="route">{element}</div>,
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>,
}));

describe('App Component', () => {
  it('renders the application with router structure', () => {
    render(<App />);
    expect(screen.getByTestId('browser-router')).toBeInTheDocument();
    expect(screen.getByTestId('routes')).toBeInTheDocument();
  });

  it('renders the login page by default', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText('Enter your email id and password to access Health Tracker')).toBeInTheDocument();
  });

  it('renders the Piramal Finance logo', () => {
    render(<App />);
    const logos = screen.getAllByAltText('Piramal Finance');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders the welcome image', () => {
    render(<App />);
    expect(screen.getByAltText('Welcome')).toBeInTheDocument();
  });

  it('shows the Health Tracker branding', () => {
    render(<App />);
    expect(screen.getByText('Health Tracker')).toBeInTheDocument();
  });

  it('renders email and password input fields', () => {
    render(<App />);
    expect(screen.getByLabelText('Email ID')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders the login button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });
});
