import { auth } from './firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function authHeader() {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { 'Authorization': `Bearer ${token}` } as Record<string,string>;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
    ...(options.headers || {}) as any
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// PRODUCTS
export interface ProductDTO { _id: string; name: string; description?: string; price?: number; stock?: number; category?: any; sku?: string; barcode?: string; pluCode?: string; taxRate?: number; taxIncluded?: boolean; wholesalePrice?: number; retailPrice?: number; subCategory?: string; }

export async function getProducts(params: { search?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  const data = await apiFetch(`/product/?${qs.toString()}`);
  const arr = Array.isArray(data) ? data : data.products || data.data || [];
  return arr as ProductDTO[];
}

// CUSTOMERS
export interface CustomerDTO { _id?: string; name: string; phone: string; email?: string; address?: { text?: string; city?: string; state?: string; zip?: string }; }

export async function getCustomerByPhone(phone: string) {
  const data = await apiFetch(`/billing/customer/?phone=${encodeURIComponent(phone)}`);
  return (data?.data || data) as CustomerDTO | null;
}

export async function searchCustomers(params: { q?: string; name?: string; phone?: string; page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v) qs.set(k, String(v)); });
  const data = await apiFetch(`/billing/customer/search?${qs.toString()}`);
  return (data?.data || data?.customers || data) as CustomerDTO[];
}

export async function createCustomer(payload: { name: string; phone: string; email?: string; address?: { text: string; city?: string; state?: string; zip?: string } }) {
  const data = await apiFetch('/billing/customer/', { method: 'POST', body: JSON.stringify(payload) });
  return data?.data || data;
}

export async function updateCustomer(id: string, payload: Partial<Parameters<typeof createCustomer>[0]>) {
  const data = await apiFetch(`/billing/customer/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  return data?.data || data;
}

// INVOICES
export interface InvoiceDTO { _id?: string; amount?: any; customer?: any; items?: any[]; type?: string; createdAt?: string; }

export async function listInvoices(params: { customer?: string; type?: string; page?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => { if (v) qs.set(k, String(v)); });
  const data = await apiFetch(`/billing/invoice/?${qs.toString()}`);
  return data?.data || data?.invoices || data;
}

export async function createInvoice(payload: any) {
  const data = await apiFetch('/billing/invoice/', { method: 'POST', body: JSON.stringify(payload) });
  return data?.data || data;
}

export { apiFetch, API_BASE };