"use client";

type CartItem = { id: string; name: string; price: number; qty: number };

export default function CartView({ className = "", items = [], onInc, onDec, onRemove }: {
  className?: string;
  items?: CartItem[];
  onInc?: (id: string) => void;
  onDec?: (id: string) => void;
  onRemove?: (id: string) => void;
}) {
  return (
    <section className={`border rounded-xl p-4 ${className}`}>
      <h2 className="text-sm font-semibold mb-3 text-slate-600">Cart</h2>
      {items.length === 0 ? (
        <div className="h-full min-h-[120px] bg-slate-50 rounded-md flex items-center justify-center text-slate-400">No items yet</div>
      ) : (
        <div className="space-y-2 pr-1">
          {items.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 border rounded-md p-2 bg-white">
              <div className="min-w-0">
                <div className="font-medium text-slate-800 truncate">{i.name}</div>
                <div className="text-xs text-slate-500">₹{i.price} × {i.qty}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 border rounded border-slate-300" onClick={() => onDec?.(i.id)}>-</button>
                <button className="px-2 py-1 border rounded border-slate-300" onClick={() => onInc?.(i.id)}>+</button>
                <button className="px-2 py-1 border rounded border-slate-300" onClick={() => onRemove?.(i.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
