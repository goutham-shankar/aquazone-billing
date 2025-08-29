"use client";
import { useState } from "react";
import { CreditCard, Banknote, Smartphone, Plus, Trash2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface PaymentMethod {
  id: string;
  type: "cash" | "card" | "upi" | "other";
  amount: number;
  reference?: string;
}

interface PaymentSectionProps {
  className?: string;
  invoiceId: string;
  totalAmount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

const PAYMENT_TYPES = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "other", label: "Other", icon: CreditCard },
];

export default function PaymentSection({
  className,
  invoiceId,
  totalAmount,
  onPaymentComplete,
  onCancel
}: PaymentSectionProps) {
  const [payments, setPayments] = useState<PaymentMethod[]>([
    { id: crypto.randomUUID(), type: "cash", amount: totalAmount }
  ]);
  const [loading, setLoading] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalAmount - totalPaid;

  const addPaymentMethod = () => {
    const newPayment: PaymentMethod = {
      id: crypto.randomUUID(),
      type: "cash",
      amount: Math.max(0, balance)
    };
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (id: string, updates: Partial<PaymentMethod>) => {
    setPayments(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const removePayment = (id: string) => {
    if (payments.length > 1) {
      setPayments(prev => prev.filter(p => p.id !== id));
    }
  };

  const processPayment = async () => {
    if (balance !== 0) {
      toast.error("Payment amounts don't match the total");
      return;
    }

    setLoading(true);
    try {
      // Create transaction for each payment method
        const transactionData = {
          invoiceId: invoiceId,
          payments: payments.map(p => ({
            amount: p.amount,
            paymentMethod: p.type,
            reference: p.reference || undefined,
            status: "completed",
          }))
        };


        const result = await api.transactions.create(transactionData);
        if (!result.success) {
          throw new Error(`Failed to create transaction: ${result.error}`);
        }

      toast.success("Payment processed successfully");
      onPaymentComplete();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Payment Processing
        </h3>
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700 text-sm"
        >
          Cancel
        </button>
      </div>

      <div className="mb-4 p-3 bg-slate-50 rounded-lg">
        <div className="flex justify-between text-sm">
          <span>Invoice Total:</span>
          <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Total Paid:</span>
          <span className={`font-semibold ${totalPaid === totalAmount ? "text-green-600" : "text-slate-700"}`}>
            ₹{totalPaid.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t pt-1 mt-1">
          <span>Balance:</span>
          <span className={`font-semibold ${balance === 0 ? "text-green-600" : balance < 0 ? "text-red-600" : "text-orange-600"}`}>
            ₹{balance.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 mb-4">
        {payments.map((payment, index) => (
          <div key={payment.id} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-700">
                Payment {index + 1}
              </span>
              {payments.length > 1 && (
                <button
                  onClick={() => removePayment(payment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <select
                value={payment.type}
                onChange={(e) => updatePayment(payment.id, { type: e.target.value as any })}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {PAYMENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={payment.amount || ""}
                onChange={(e) => updatePayment(payment.id, { amount: Number(e.target.value) || 0 })}
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            {(payment.type === "card" || payment.type === "upi" || payment.type === "other") && (
              <input
                type="text"
                placeholder="Reference/Transaction ID"
                value={payment.reference || ""}
                onChange={(e) => updatePayment(payment.id, { reference: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addPaymentMethod}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Payment Method
        </button>

        <button
          onClick={processPayment}
          disabled={loading || balance !== 0}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Check className="w-4 h-4" />
          {loading ? "Processing..." : "Complete Payment"}
        </button>
      </div>

      {balance !== 0 && (
        <p className="text-sm text-orange-600 mt-2 text-center">
          Please adjust payment amounts to match the total
        </p>
      )}
    </div>
  );
}
