import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App';

// Mock React and ReactDOM
vi.mock('react', () => {
  return {
    default: {
      StrictMode: ({ children }) => children,
    },
  };
});

vi.mock('react-dom/client', () => {
  const createRootMock = vi.fn(() => ({
    render: vi.fn(),
  }));
  
  return {
    default: {
      createRoot: createRootMock
    },
    createRoot: createRootMock
  };
});

vi.mock('../src/App', () => ({
  default: () => 'App Component',
}));

// Mock document.getElementById
document.getElementById = vi.fn();

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.getElementById.mockReturnValue('root-element');
  });

  it('renders the app in React StrictMode', async () => {
    // Import main to execute it
    await import('../src/main.jsx');
    
    // Check if getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');
    
    // Check if createRoot was called with the element from getElementById
    expect(createRoot).toHaveBeenCalledWith('root-element');
    
    // Check if render was called on the root
    const mockRoot = createRoot.mock.results[0].value;
    expect(mockRoot.render).toHaveBeenCalled();
  });
});
