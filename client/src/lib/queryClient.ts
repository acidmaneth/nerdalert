import { QueryClient, QueryFunction } from "@tanstack/react-query";

declare global {
  interface ImportMetaEnv {
    VITE_NERDALERT_API_URL?: string;
    VITE_WEBBASE_URL?: string;
    [key: string]: any;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Determine the API base URL based on environment
const getApiBase = () => {
  // For production, use the Cloudflare setup
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NERDALERT_API_URL) {
    return import.meta.env.VITE_NERDALERT_API_URL;
  }
  
  // Check for VITE_WEBBASE_URL (Vite environment variable)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WEBBASE_URL && import.meta.env.VITE_WEBBASE_URL !== "/") {
    return import.meta.env.VITE_WEBBASE_URL;
  }
  
  // Development fallback
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:80';
  }
  
  // Production fallback - your Cloudflare setup
  return 'https://nerdalert.app';
};

const API_BASE = getApiBase();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = url.startsWith('http') ? url : API_BASE.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

