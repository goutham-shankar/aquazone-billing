"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type ResultItem = {
  kind: "customer" | "product";
  id: string;
  title: string;
  subtitle?: string;
  raw: any;
};

function useDebounced<T>(value: T, delay = 400): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function GlobalSearch({ open, onClose, onPickCustomer, onPickProduct }: {
  open: boolean;
  onClose: () => void;
  onPickCustomer?: (c: any) => void;
  onPickProduct?: (p: any) => void;
}) {
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 400);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCustomers([]);
    setProducts([]);
    setActiveIndex(0);
    setError(null);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!open) return;
      if (!q || q.length < 2) {
        setCustomers([]);
        setProducts([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [c, p] = await Promise.all([
          api.customers.search({ q, limit: 5 }),
          api.products.list({ search: q, limit: 5 }),
        ]);
        if (cancelled) return;
        if (c.success) setCustomers((c as any).data?.items ?? []);
        else setCustomers([]);
        if (p.success) setProducts((p as any).data?.items ?? []);
        else setProducts([]);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Search failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [q, open]);

  const flat: ResultItem[] = useMemo(() => {
    const items: ResultItem[] = [];
    for (const c of customers) {
      items.push({ kind: "customer", id: c._id || c.id, title: c.name || c.email || c.phone, subtitle: c.phone || c.email, raw: c });
    }
    for (const p of products) {
      const price = p.retailPrice ?? p.price ?? p.wholesalePrice;
      items.push({ kind: "product", id: p._id || p.id, title: p.name, subtitle: typeof price !== "undefined" ? `₹${price}` : undefined, raw: p });
    }
    return items;
  }, [customers, products]);

  useEffect(() => {
    if (activeIndex >= flat.length) setActiveIndex(0);
  }, [flat.length, activeIndex]);

  function select(idx: number) {
    const item = flat[idx];
    if (!item) return;
    if (item.kind === "customer") onPickCustomer?.(item.raw);
    if (item.kind === "product") onPickProduct?.(item.raw);
    try {
      const ev = new CustomEvent("global-search-pick", { detail: { kind: item.kind, item: item.raw } });
      window.dispatchEvent(ev);
    } catch {}
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30" onClick={onClose}>
      <div className="mt-24 w-[900px] max-w-[90vw] rounded-xl bg-white shadow-xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flat.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
              if (e.key === "Enter") { e.preventDefault(); select(activeIndex); }
            }}
            placeholder="Search products, customers, invoices..."
            className="w-full h-12 px-4 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div className="max-h-[420px] overflow-auto p-2 text-sm text-gray-700">
          {error && <div className="p-4 text-red-600">{error}</div>}
          {!error && !loading && !q && (
            <div className="py-12 text-center text-gray-400">Type at least 2 characters to search.</div>
          )}
          {!error && loading && (
            <div className="py-12 text-center text-gray-400 animate-pulse">Searching…</div>
          )}
          {!error && !loading && q && flat.length === 0 && (
            <div className="py-12 text-center text-gray-400">No results.</div>
          )}
          {!error && !loading && flat.length > 0 && (
            <div className="divide-y">
              {customers.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs uppercase tracking-wide text-gray-400">Customers</div>
                  {customers.map((c, idx) => {
                    const i = idx; // first group starts at 0
                    const isActive = activeIndex === i;
                    return (
                      <div
                        key={c._id || c.id}
                        onClick={() => select(i)}
                        className={`px-3 py-2 cursor-pointer rounded-md ${isActive ? "bg-sky-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="font-medium">{c.name || c.email || c.phone}</div>
                        {(c.phone || c.email) && <div className="text-xs text-gray-500">{c.phone || c.email}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
              {products.length > 0 && (
                <div className="py-2">
                  <div className="px-3 py-1 text-xs uppercase tracking-wide text-gray-400">Products</div>
                  {products.map((p, idx) => {
                    const i = customers.length + idx;
                    const isActive = activeIndex === i;
                    const price = p.retailPrice ?? p.price ?? p.wholesalePrice;
                    return (
                      <div
                        key={p._id || p.id}
                        onClick={() => select(i)}
                        className={`px-3 py-2 cursor-pointer rounded-md ${isActive ? "bg-sky-50" : "hover:bg-gray-50"}`}
                      >
                        <div className="font-medium">{p.name}</div>
                        {typeof price !== "undefined" && <div className="text-xs text-gray-500">₹{price}</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
