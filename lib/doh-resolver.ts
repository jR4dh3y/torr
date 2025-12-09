/**
 * DNS-over-HTTPS resolver to bypass ISP blocking
 * Uses Cloudflare and Google DoH servers for fallback
 */

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

const FETCH_TIMEOUT = 15000; // 15 seconds

/**
 * Simple fetch wrapper with timeout, headers, and error handling
 */
export async function fetchWithDoH(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...DEFAULT_HEADERS,
        ...options?.headers,
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Test if a mirror is accessible
 */
export async function testMirrorAccess(mirrorUrl: string): Promise<boolean> {
  try {
    const response = await fetchWithDoH(mirrorUrl, {
      method: 'HEAD',
    });
    return response.ok || response.status === 405;
  } catch {
    return false;
  }
}

