"use client";
import { FileText, CreditCard, Percent } from "lucide-react";

interface InvoicePreviewProps {
  subTotal: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  onCreate: () => void;
  onPayment?: () => void;
  onDiscountClick?: () => void;
  showPaymentButton?: boolean;
  showDiscountButton?: boolean;
}

export default function InvoicePreview({
  subTotal,
  discountAmount,
  taxPercent,
  taxAmount,
  total,
  onCreate,
  onPayment,
  onDiscountClick,
  showPaymentButton = false,
  showDiscountButton = false
}: InvoicePreviewProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Invoice Summary
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Summary */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">₹{subTotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount:</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          {taxPercent > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-gray-400">Tax ({taxPercent}%):</span>
              <span className="font-medium text-gray-900 dark:text-white">₹{taxAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="border-t dark:border-gray-600 pt-2">
            <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {showDiscountButton && (
            <button
              onClick={onDiscountClick}
              className="w-full py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Percent className="w-4 h-4" />
              Discounts & Tax
            </button>
          )}
          
          <button
            onClick={onCreate}
            disabled={total <= 0}
            className="w-full py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-md hover:bg-sky-700 dark:hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Invoice
          </button>
          
          {showPaymentButton && (
            <button
              onClick={onPayment}
              className="w-full py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Process Payment
            </button>
          )}
          
          <div className="text-xs text-slate-500 dark:text-gray-400 text-center">
            Press Ctrl+Enter to create invoice quickly
          </div>
        </div>
      </div>
    </div>
  );
}
