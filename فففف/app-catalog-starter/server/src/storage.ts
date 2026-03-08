import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import type { AppInput, AppItem } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'apps.json');

const seed: AppItem[] = [
  {
    id: nanoid(),
    name: 'Focus Notes',
    bundleId: 'com.example.focusnotes',
    version: '1.0.0',
    description: 'A simple productivity and notes app.',
    iconUrl: 'https://placehold.co/128x128',
    websiteUrl: 'https://example.com/focusnotes',
    category: 'Productivity',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: nanoid(),
    name: 'Fit Tracker',
    bundleId: 'com.example.fittracker',
    version: '2.1.0',
    description: 'Track workouts and daily movement.',
    iconUrl: 'https://placehold.co/128x128',
    websiteUrl: 'https://example.com/fittracker',
    category: 'Health'
    ,createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function ensureDataFile(): void {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(seed, null, 2), 'utf8');
  }
}

export function readApps(): AppItem[] {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataPath, 'utf8')) as AppItem[];
}

export function writeApps(apps: AppItem[]): void {
  fs.writeFileSync(dataPath, JSON.stringify(apps, null, 2), 'utf8');
}

export function createApp(input: AppInput): AppItem {
  const apps = readApps();
  const now = new Date().toISOString();
  const item: AppItem = {
    id: nanoid(),
    ...input,
    createdAt: now,
    updatedAt: now
  };
  apps.push(item);
  writeApps(apps);
  return item;
}

export function updateApp(id: string, input: Partial<AppInput>): AppItem | null {
  const apps = readApps();
  const index = apps.findIndex((app) => app.id === id);
  if (index === -1) return null;

  const updated: AppItem = {
    ...apps[index],
    ...input,
    updatedAt: new Date().toISOString()
  };

  apps[index] = updated;
  writeApps(apps);
  return updated;
}

export function deleteApp(id: string): boolean {
  const apps = readApps();
  const filtered = apps.filter((app) => app.id !== id);
  if (filtered.length === apps.length) return false;
  writeApps(filtered);
  return true;
}
