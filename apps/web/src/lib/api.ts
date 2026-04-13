import type {
  GlossaryItem,
  HistoryItem,
  PipelineRun,
  StudentProfileInput,
  UniversityOption,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getApiBase() {
  return API_BASE;
}

export function fetchUniversities(query: string) {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  return fetchJson<UniversityOption[]>(`/api/universities?${params.toString()}`);
}

export function fetchGlossary() {
  return fetchJson<GlossaryItem[]>('/api/glossary');
}

export function fetchHistory() {
  return fetchJson<HistoryItem[]>('/api/history');
}

export function startPipeline(payload: StudentProfileInput) {
  return fetchJson<{ run_id: string }>('/api/pipeline/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchPipeline(runId: string) {
  return fetchJson<PipelineRun>(`/api/pipeline/${runId}`);
}

