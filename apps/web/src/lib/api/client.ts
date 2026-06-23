const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001/api'
).replace(/\/$/, '');

interface ApiEnvelope<T> {
  data: T;
  error: {
    code?: string;
    message?: string;
  } | null;
  success: boolean;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    'error' in value
  );
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? ((await response.json()) as unknown)
    : null;
  const envelope = isApiEnvelope<T>(payload) ? payload : null;

  if (!response.ok) {
    throw new ApiClientError(
      envelope?.error?.message ?? 'API request failed',
      response.status,
      envelope?.error?.code,
    );
  }

  if (envelope) {
    if (!envelope.success) {
      throw new ApiClientError(
        envelope.error?.message ?? 'API request failed',
        response.status,
        envelope.error?.code,
      );
    }

    return envelope.data;
  }

  return payload as T;
}

export const apiRequest = apiFetch;
