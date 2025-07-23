/**
 * Simple API Fetcher for AI-BOS Shared Library
 */

export async function apiFetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, options);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  return response.json();
}
