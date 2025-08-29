"use client";
import { useState } from "react";
import { Percent, DollarSign, X } from "lucide-react";

interface DiscountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  discountAmount: number;
  taxPercent: number;
  onChangeDiscountAmount: (amount: number) => void;
  onChangeTaxPercent: (percent: number) => void;
}

export default function DiscountDialog({
  isOpen,
  onClose,
  discountAmount,
  taxPercent,
  onChangeDiscountAmount,
  onChangeTaxPercent
}: DiscountDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Discounts & Tax
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
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
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
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
            <div className="relative mb-3">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={taxPercent || ""}
                onChange={(e) => onChangeTaxPercent(Number(e.target.value) || 0)}
              />
            </div>

            {/* Quick Tax Buttons */}
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Quick Tax Rates</div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onChangeTaxPercent(rate)}
                    className={`py-2 px-3 text-sm rounded transition-colors ${
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

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
