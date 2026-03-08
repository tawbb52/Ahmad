import { useEffect, useState } from 'react';
import { createApp, fetchApps, removeApp } from './api';
import type { AppItem, AppPayload } from './types';

const initialForm: AppPayload = {
  name: '',
  bundleId: '',
  version: '',
  description: '',
  iconUrl: '',
  websiteUrl: '',
  category: ''
};

export function App() {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [form, setForm] = useState<AppPayload>(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setApps(await fetchApps());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createApp(form);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  async function onDelete(id: string) {
    try {
      await removeApp(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', fontFamily: 'sans-serif', padding: 24 }}>
      <h1>App Catalog Admin</h1>
      <p>Simple admin dashboard for managing app records.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            value={value}
            placeholder={key}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            style={{ padding: 10 }}
            required
          />
        ))}
        <button type="submit" style={{ padding: 12 }}>Add App</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div style={{ display: 'grid', gap: 16 }}>
        {apps.map((app) => (
          <article key={app.id} style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16 }}>
            <h2>{app.name}</h2>
            <p>{app.description}</p>
            <p><strong>Version:</strong> {app.version}</p>
            <p><strong>Category:</strong> {app.category}</p>
            <a href={app.websiteUrl} target="_blank" rel="noreferrer">Website</a>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => void onDelete(app.id)}>Delete</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
