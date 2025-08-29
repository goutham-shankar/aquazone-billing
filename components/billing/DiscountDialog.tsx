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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <Percent className="w-5 h-5" />
              Discounts & Tax
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Discount Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Discount Amount (₹)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                value={discountAmount || ""}
                onChange={(e) => onChangeDiscountAmount(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Tax Percentage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Tax Percentage (%)
            </label>
            <div className="relative mb-3">
              <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
                value={taxPercent || ""}
                onChange={(e) => onChangeTaxPercent(Number(e.target.value) || 0)}
              />
            </div>

            {/* Quick Tax Buttons */}
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Quick Tax Rates</div>
              <div className="grid grid-cols-5 gap-2">
                {[0, 5, 12, 18, 28].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => onChangeTaxPercent(rate)}
                    className={`py-2 px-3 text-sm rounded transition-colors ${
                      taxPercent === rate
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-750 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-md hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
