import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Health from '../src/components/Health';
import * as healthClient from '../src/client/health';

vi.mock('../src/client/health', () => ({
  checkHealth: vi.fn()
}));

describe('Health Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    render(<Health />);
    expect(screen.getByText('Checking systems...')).toBeInTheDocument();
  });

  it('displays health status after API call resolves', async () => {
    healthClient.checkHealth.mockResolvedValueOnce({ 
      status: 'ok',
      testVar: 'test-value' 
    });
    
    render(<Health />);
    
    await waitFor(() => {
      expect(screen.queryByText('Checking systems...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    
    const statusElements = screen.getAllByText('OK');
    expect(statusElements.length).toBe(2);
    
    expect(screen.getByText('Backend Test Variable:')).toBeInTheDocument();
    expect(screen.getByText('test-value')).toBeInTheDocument();
  });

  it('handles errors when API call fails', async () => {
    // Mock the console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = vi.fn();
    
    // Mock the API call to reject with an error
    const testError = new Error('Health check failed');
    healthClient.checkHealth.mockRejectedValueOnce(testError);
    
    render(<Health />);
    
    // Wait for the loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Checking systems...')).not.toBeInTheDocument();
    });
    
    // Verify error state is shown
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    
    // Error is shown for backend
    const errorElements = screen.getAllByText('Error');
    expect(errorElements.length).toBe(1);
    
    // Verify console.error was called with the error message
    expect(console.error).toHaveBeenCalledWith('Health check failed:', testError);
    
    // Restore original console.error
    console.error = originalConsoleError;
  });
  
  it('updates loading state when checkStatus completes', async () => {
    // Mock a delayed API response to test the loading state transitions
    healthClient.checkHealth.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({ status: 'ok', testVar: 'test-value' });
        }, 10);
      })
    );
    
    render(<Health />);
    
    // Initially in loading state
    expect(screen.getByText('Checking systems...')).toBeInTheDocument();
    
    // Should transition to loaded state
    await waitFor(() => {
      expect(screen.queryByText('Checking systems...')).not.toBeInTheDocument();
      expect(screen.getAllByText('OK').length).toBe(2);
    });
  });
});
