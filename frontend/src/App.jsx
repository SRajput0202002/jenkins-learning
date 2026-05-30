import { useEffect, useState } from 'react';
import { fetchMessage, getApiBaseUrl } from './api/client.js';
import './App.css';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadMessage() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMessage();
      setData(result);
    } catch (err) {
      setError(err.message ?? 'Failed to reach backend');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessage();
  }, []);

  return (
    <div className="app">
      <div className="card">
        <span className="badge">CI/CD Learning Project</span>
        <h1>FastAPI + React</h1>
        <p className="subtitle">
          Homepage calls the backend API on load. Use this app to learn Jenkins,
          Docker, and fullstack deployment.
        </p>

        <div className="actions">
          <button
            type="button"
            className="btn-primary"
            onClick={loadMessage}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh message'}
          </button>
        </div>

        <div
          className={`response-box ${loading ? 'loading' : error ? 'error' : 'success'}`}
        >
          {loading && <span>Fetching from backend…</span>}
          {!loading && error && <span>{error}</span>}
          {!loading && !error && data && (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>

        <p className="meta">
          API base: <code>{getApiBaseUrl()}</code>
        </p>
      </div>
    </div>
  );
}
