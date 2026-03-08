import express from 'express';
import cors from 'cors';
import { createApp, deleteApp, readApps, updateApp } from './storage.js';
import type { AppInput } from './types.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'app-catalog-server' });
});

app.get('/apps', (_req, res) => {
  res.json(readApps());
});

app.get('/apps/:id', (req, res) => {
  const item = readApps().find((app) => app.id === req.params.id);
  if (!item) {
    res.status(404).json({ message: 'App not found' });
    return;
  }
  res.json(item);
});

app.post('/apps', (req, res) => {
  const body = req.body as Partial<AppInput>;
  const required = ['name', 'bundleId', 'version', 'description', 'iconUrl', 'websiteUrl', 'category'] as const;
  const missing = required.filter((field) => !body[field]);

  if (missing.length > 0) {
    res.status(400).json({ message: `Missing fields: ${missing.join(', ')}` });
    return;
  }

  const created = createApp(body as AppInput);
  res.status(201).json(created);
});

app.put('/apps/:id', (req, res) => {
  const updated = updateApp(req.params.id, req.body as Partial<AppInput>);
  if (!updated) {
    res.status(404).json({ message: 'App not found' });
    return;
  }
  res.json(updated);
});

app.delete('/apps/:id', (req, res) => {
  const ok = deleteApp(req.params.id);
  if (!ok) {
    res.status(404).json({ message: 'App not found' });
    return;
  }
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
