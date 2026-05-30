import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../src/App.jsx';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('displays backend message when API succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              message: 'Hello from FastAPI backend',
              source: 'fastapi-react-jenkins-demo',
            }),
        })
      )
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Hello from FastAPI backend/)).toBeInTheDocument();
    });
  });

  it('shows error when API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error')))
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });
});
