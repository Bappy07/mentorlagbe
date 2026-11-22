
import { API_URL } from "./config";

const TOKEN_KEY = "mentorlagbe_token";

export type ApiResult<T> = T & {
  success?: boolean;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

/** Exchange the Better Auth cookie session for a JWT used by protected APIs. */
export async function issueToken() {
  const response = await fetch(`${API_URL}/auth/token`, {
    method: "POST",
    credentials: "include",
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body.token) {
    throw new ApiError(body.message || "Could not create a session token.", response.status);
  }

  setToken(body.token);
  return body.token as string;
}

export async function apiFetch<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken();
  const isForm = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isForm ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      body.message || `Request failed with status ${response.status}.`,
      response.status
    );
  }

  return body as ApiResult<T>;
}

export function jsonBody(data: unknown) {
  return JSON.stringify(data);
}
