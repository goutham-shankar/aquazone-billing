"use client";

export default function InvoicePreview({ subTotal = 0, discountAmount = 0, taxPercent = 0, taxAmount = 0, total = 0, onCreate }: {
  subTotal?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  total?: number;
  onCreate?: () => void;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white/80 border-slate-200">
      <h2 className="text-sm font-semibold mb-3 text-slate-600">Invoice Preview</h2>
      <div className="space-y-2 text-sm text-slate-700">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax ({taxPercent}%)</span><span>₹{taxAmount.toFixed(2)}</span></div>
        <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold text-base text-slate-900"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
      </div>
      <div className="mt-4">
        <button onClick={onCreate} className="px-4 py-2 rounded-md bg-sky-600 text-white">Create Invoice (Ctrl+Enter)</button>
      </div>
    </div>
  );
}
