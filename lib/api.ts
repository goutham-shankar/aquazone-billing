import { getFirebaseAuth } from "./firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ApiResult<T> = { 
  success: true; 
  data: T; 
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  [key: string]: any;
} | { 
  success: false; 
  error: string; 
  details?: any;
};

async function getIdToken(): Promise<string | undefined> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return undefined;
    return await user.getIdToken();
  } catch {
    return undefined;
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  if (!BASE_URL) {
    console.error("API Base URL not configured. Please set NEXT_PUBLIC_API_BASE_URL environment variable.");
    return { success: false, error: "API not configured. Please contact administrator." } as any;
  }

  try {
    const token = await getIdToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: json?.error || res.statusText, details: json } as any;
    }
    return json as ApiResult<T>;
  } catch (error: any) {
    console.error("API fetch error:", error);
    return { success: false, error: error.message || "Network error" } as any;
  }
}

// Convenience endpoints based on api.md
export const api = {
  health: () => apiFetch<{ status: string }>(`/health`),
  auth: {
    signinWithToken: (idToken: string) => apiFetch<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>(`/auth/signin-with-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }),
  },
  categories: {
    list: () => apiFetch<any[]>(`/category/`),
    get: (id: string) => apiFetch<any>(`/category/${id}`),
  },
  products: {
    list: (q?: Record<string, any>) => apiFetch<{ products: any[] }>(`/product/${q ? `?${new URLSearchParams(q as any)}` : ""}`),
    get: (id: string) => apiFetch<any>(`/product/${id}`),
  },
  customers: {
    get: (params: { id?: string; email?: string; phone?: string }) => apiFetch<any>(`/billing/customer/${Object.keys(params).length ? `?${new URLSearchParams(params as any)}` : ""}`),
    search: (q: Record<string, any>) => apiFetch<any[]>(`/billing/customer/search?${new URLSearchParams(q as any)}`),
    create: (body: any) => apiFetch<any>(`/billing/customer/`, { method: "POST", body: JSON.stringify(body) }),
  },
  invoices: {
    list: (q?: Record<string, any>) => apiFetch<any[]>(`/billing/invoice/${q ? `?${new URLSearchParams(q as any)}` : ""}`),
    get: (id: string) => apiFetch<any>(`/billing/invoice/${id}`),
    create: (body: any) => apiFetch<any>(`/billing/invoice/`, { method: "POST", body: JSON.stringify(body) }),
  },
  transactions: {
    list: (q?: Record<string, any>) => apiFetch<any[]>(`/billing/transaction/${q ? `?${new URLSearchParams(q as any)}` : ""}`),
    get: (id: string) => apiFetch<any>(`/billing/transaction/${id}`),
    create: (body: any) => apiFetch<any>(`/billing/transaction/`, { method: "POST", body: JSON.stringify(body) }),
  },
};
