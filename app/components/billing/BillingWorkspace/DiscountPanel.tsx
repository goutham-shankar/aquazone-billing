"use client";

export default function DiscountPanel({ className = "", discountAmount = 0, taxPercent = 0, onChangeDiscountAmount, onChangeTaxPercent }: {
  className?: string;
  discountAmount?: number;
  taxPercent?: number;
  onChangeDiscountAmount?: (v: number) => void;
  onChangeTaxPercent?: (v: number) => void;
}) {
  return (
    <section className={`border rounded-xl p-4 ${className}`}>
      <h2 className="text-sm font-semibold mb-3 text-slate-600">Discounts</h2>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-600">Flat discount (₹)</label>
          <input type="number" value={discountAmount}
            onChange={(e) => onChangeDiscountAmount?.(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 rounded border border-slate-300"/>
        </div>
        <div>
          <label className="text-sm text-slate-600">Tax (%)</label>
          <input type="number" value={taxPercent}
            onChange={(e) => onChangeTaxPercent?.(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 rounded border border-slate-300"/>
        </div>
      </div>
    </section>
  );
}
