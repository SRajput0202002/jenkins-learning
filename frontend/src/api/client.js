/**
 * API client — uses Vite environment variable VITE_API_URL.
 * Default: http://localhost:8000 (local backend with uvicorn)
 */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function fetchMessage() {
  const response = await fetch(`${API_BASE}/api/message`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function getApiBaseUrl() {
  return API_BASE;
}
