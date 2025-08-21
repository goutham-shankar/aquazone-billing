import { getFirebaseAuth } from "./firebase";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export type ApiResult<T> = { success: true; data: T; message?: string } | { success: false; error: string; details?: any };

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
}

// Convenience endpoints based on api.md
export const api = {
  health: () => apiFetch<{ status: string }>(`/health`),
  products: {
    list: (q?: Record<string, any>) => apiFetch<{ items: any[]; total: number }>(`/product/${q ? `?${new URLSearchParams(q as any)}` : ""}`),
    get: (id: string) => apiFetch<any>(`/product/${id}`),
  },
  customers: {
    get: (params: { id?: string; email?: string; phone?: string }) => apiFetch<any>(`/customer/${Object.keys(params).length ? `?${new URLSearchParams(params as any)}` : ""}`),
    search: (q: Record<string, any>) => apiFetch<{ items: any[]; total: number }>(`/customer/search?${new URLSearchParams(q as any)}`),
    create: (body: any) => apiFetch<any>(`/customer/`, { method: "POST", body: JSON.stringify(body) }),
  },
  invoices: {
    list: (q?: Record<string, any>) => apiFetch<{ items: any[]; total: number }>(`/invoice/${q ? `?${new URLSearchParams(q as any)}` : ""}`),
    get: (id: string) => apiFetch<any>(`/invoice/${id}`),
    create: (body: any) => apiFetch<any>(`/invoice/`, { method: "POST", body: JSON.stringify(body) }),
    downloadPdf: async (id: string) => {
      const token = await getIdToken();
      const res = await fetch(`${BASE_URL}/invoice/${id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      return blob;
    },
  },
};
