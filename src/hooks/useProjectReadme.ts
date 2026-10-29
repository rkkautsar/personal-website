import { useEffect, useState } from 'react';
import type { Repository } from '@/types/github';

const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

type CachedReadme = {
  text: string;
  fetchedAt: number;
};

type ReadmeState = {
  text: string;
  loading: boolean;
  unavailable: boolean;
};

function cacheKey(repositoryUrl: string) {
  return `personal-website:readme:${repositoryUrl}`;
}

function readCachedReadme(repositoryUrl: string): CachedReadme | null {
  try {
    const serialized = localStorage.getItem(cacheKey(repositoryUrl));
    if (!serialized) return null;
    const value: unknown = JSON.parse(serialized);
    if (
      value &&
      typeof value === 'object' &&
      'text' in value &&
      typeof value.text === 'string' &&
      'fetchedAt' in value &&
      typeof value.fetchedAt === 'number'
    ) {
      return value as CachedReadme;
    }
  } catch {
    // Storage may be unavailable or contain data from an older format.
  }
  return null;
}

function getReadmeEndpoint(repositoryUrl: string) {
  try {
    const url = new URL(repositoryUrl);
    const [owner, repository] = url.pathname.split('/').filter(Boolean);
    if (url.hostname !== 'github.com' || !owner || !repository) return null;
    return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository.replace(/\.git$/, ''))}/readme`;
  } catch {
    return null;
  }
}

export function useProjectReadme(project: Repository | null) {
  const repositoryUrl = project?.url ?? '';
  const [state, setState] = useState<ReadmeState>({
    text: '',
    loading: Boolean(project),
    unavailable: false,
  });

  useEffect(() => {
    if (!repositoryUrl) {
      setState({ text: '', loading: false, unavailable: false });
      return;
    }

    const controller = new AbortController();
    const cached = readCachedReadme(repositoryUrl);
    const endpoint = getReadmeEndpoint(repositoryUrl);

    setState({
      text: cached?.text ?? '',
      loading: !cached,
      unavailable: false,
    });

    if (cached && Date.now() - cached.fetchedAt < maxAgeMs) {
      return () => controller.abort();
    }

    if (!endpoint) {
      setState({
        text: cached?.text ?? '',
        loading: false,
        unavailable: !cached,
      });
      return () => controller.abort();
    }

    fetch(endpoint, {
      headers: { Accept: 'application/vnd.github.raw+json' },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`GitHub README returned ${response.status}`);
        const text = (await response.text()).trim();
        if (!text) throw new Error('GitHub README is empty.');

        const next: CachedReadme = { text, fetchedAt: Date.now() };
        try {
          localStorage.setItem(cacheKey(repositoryUrl), JSON.stringify(next));
        } catch {
          // The dialog can still show this response if storage is unavailable.
        }
        setState({ text, loading: false, unavailable: false });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        if (!cached) setState({ text: '', loading: false, unavailable: true });
      });

    return () => controller.abort();
  }, [repositoryUrl]);

  return state;
}
