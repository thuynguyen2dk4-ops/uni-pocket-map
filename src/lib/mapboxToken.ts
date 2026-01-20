const STORAGE_KEY = 'unipocket_mapbox_token';

export const getMapboxToken = (): string | null => {
  const envToken = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) ?? undefined;
  if (envToken && envToken !== 'undefined' && envToken.trim().length > 0) return envToken.trim();

  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
  }

  return null;
};

export const setMapboxToken = (token: string) => {
  if (typeof window === 'undefined') return;
  const t = token.trim();
  if (!t) return;
  window.localStorage.setItem(STORAGE_KEY, t);
};

export const clearMapboxToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
