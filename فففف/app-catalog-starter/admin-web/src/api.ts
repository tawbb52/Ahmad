import type { AppItem, AppPayload } from './types';

const API_URL = 'http://localhost:4000';

export async function fetchApps(): Promise<AppItem[]> {
  const res = await fetch(`${API_URL}/apps`);
  if (!res.ok) throw new Error('Failed to load apps');
  return res.json();
}

export async function createApp(payload: AppPayload): Promise<AppItem> {
  const res = await fetch(`${API_URL}/apps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create app');
  return res.json();
}

export async function removeApp(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/apps/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete app');
}
