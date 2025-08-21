"use client";

type Customer = { id: string; name?: string; email?: string; phone?: string } | undefined;

export default function CustomerSection({ className = "", customer, onClear }: { className?: string; customer?: Customer; onClear?: () => void }) {
  return (
    <section className={`border rounded-xl p-4 ${className}`}>
      <h2 className="text-sm font-semibold mb-3 text-slate-600">Customer</h2>
      {!customer ? (
        <div className="h-full min-h-[160px] bg-slate-50 rounded-md flex items-center justify-center text-slate-400">
          Search and pick a customer (Ctrl+F)
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-base font-medium text-slate-800">{customer.name || customer.email || customer.phone}</div>
          {(customer.email || customer.phone) && (
            <div className="text-sm text-slate-500">{customer.email || customer.phone}</div>
          )}
          <button onClick={onClear} className="mt-2 px-3 py-2 text-sm rounded-md border border-slate-300 hover:bg-slate-50">Clear</button>
        </div>
      )}
    </section>
  );
}
