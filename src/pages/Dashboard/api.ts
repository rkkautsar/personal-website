export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, { ...init, credentials: 'same-origin', redirect: 'error' });
  if (!response.ok) {
    throw new Error(response.status === 401 || response.status === 403
      ? 'Admin access denied. Reload the dashboard to sign in with an authorized account.'
      : `Request failed (${response.status}). Please try again.`);
  }
  return response;
}
