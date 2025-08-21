"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Product = { id: string; _id?: string; name: string; price?: number; retailPrice?: number; wholesalePrice?: number };

export default function ProductCatalog({ className = "", onAdd }: { className?: string; onAdd?: (p: { id: string; name: string; price?: number }) => void }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const r = await api.products.list({ search: q, limit: 12 });
        if (!cancelled) {
          setItems(r.success ? ((r as any).data?.items ?? []) : []);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <section className={`border rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-600">Product Catalog</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="h-10 px-3 rounded border border-slate-300" />
      </div>
      <div className="h-[calc(100%-44px)] overflow-auto pr-1">
      {err && <div className="p-4 text-red-600 text-sm">{err}</div>}
      {loading ? (
        <div className="h-[200px] bg-slate-50 rounded animate-pulse" />
      ) : items.length === 0 ? (
        <div className="h-[200px] bg-slate-50 rounded flex items-center justify-center text-slate-400">No products</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((p) => {
            const price = p.retailPrice ?? p.price ?? p.wholesalePrice;
            return (
              <div key={p._id || p.id} className="border rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">{p.name}</div>
                  {typeof price !== "undefined" && <div className="text-xs text-slate-500">₹{price}</div>}
                </div>
                <button className="px-3 py-2 text-sm rounded-md border border-slate-300" onClick={() => onAdd?.({ id: (p._id || p.id)!, name: p.name, price: price })}>Add</button>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </section>
  );
}
