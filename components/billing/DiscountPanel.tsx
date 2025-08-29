"use client";
import { Percent, DollarSign } from "lucide-react";

interface DiscountPanelProps {
  className?: string;
  discountAmount: number;
  taxPercent: number;
  onChangeDiscountAmount: (amount: number) => void;
  onChangeTaxPercent: (percent: number) => void;
}

export default function DiscountPanel({
  className,
  discountAmount,
  taxPercent,
  onChangeDiscountAmount,
  onChangeTaxPercent
}: DiscountPanelProps) {
  return (
    <div className={`border rounded-lg p-4 flex flex-col ${className}`}>
      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Percent className="w-4 h-4" />
        Discounts & Tax
      </h3>

      <div className="space-y-4">
        {/* Discount Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Discount Amount (₹)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={discountAmount || ""}
              onChange={(e) => onChangeDiscountAmount(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Tax Percentage */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tax Percentage (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={taxPercent || ""}
              onChange={(e) => onChangeTaxPercent(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Quick Tax Buttons */}
        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">Quick Tax</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 5, 12, 18, 28].map((rate) => (
              <button
                key={rate}
                onClick={() => onChangeTaxPercent(rate)}
                className={`py-1 px-2 text-xs rounded transition-colors ${
                  taxPercent === rate
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
