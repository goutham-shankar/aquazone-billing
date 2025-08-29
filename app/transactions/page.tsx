"use client";
import { useState, useEffect } from "react";
import { Search, CreditCard, Banknote, Smartphone, Eye, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Transaction {
  _id: string;
  invoiceId: {
    _id: string;
    invoiceId: number;
  };
  customerId: {
    _id: string;
    name: string;
    email: string;
  };
  salesman: {
    _id: string;
    name: string;
    email: string;
  };
  transactionId: number;
  amount: number;
  paymentMethod: "cash" | "card" | "upi" | "other";
  reference?: string;
  status: "pending" | "completed" | "failed";
  type: "payment" | "refund";
  createdAt: string;
}

const PAYMENT_ICONS = {
  cash: Banknote,
  card: CreditCard,
  upi: Smartphone,
  other: CreditCard,
};

const METHOD_COLORS = {
  cash: "bg-green-100 text-green-800",
  card: "bg-blue-100 text-blue-800",
  upi: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800",
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [methodFilter, statusFilter, typeFilter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      
      const response = await api.transactions.list(params);
      if (response.success) {
        setTransactions(response.data || []);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetails(true);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (methodFilter !== "all" && transaction.paymentMethod !== methodFilter) return false;
    if (statusFilter !== "all" && transaction.status !== statusFilter) return false;
    if (typeFilter !== "all" && transaction.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="refund">Refunds</option>
          </select>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading transactions...</div>
        ) : filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {filteredTransactions.map((transaction) => {
              const Icon = PAYMENT_ICONS[transaction.paymentMethod] || CreditCard;
              
              return (
                <div
                  key={transaction._id}
                  className="p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                        <Icon className="w-5 h-5 text-sky-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-slate-800">
                            Transaction #{transaction._id.slice(-6)}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${METHOD_COLORS[transaction.paymentMethod]}`}>
                            {transaction.paymentMethod.toUpperCase()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[transaction.status]}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-slate-600 mt-1">
                          Invoice #{transaction.invoiceId.invoiceId}
                          {transaction.reference && ` • Ref: ${transaction.reference}`}
                        </div>
                        
                        <div className="text-sm text-slate-500 mt-1">
                          {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.type}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        transaction.type === "payment" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "payment" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => viewTransactionDetails(transaction)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">No transactions found</div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Transaction #{selectedTransaction._id.slice(-6)}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-md"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Transaction ID</label>
                  <div className="text-slate-900 font-mono">{selectedTransaction.transactionId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice ID</label>
                  <div className="text-slate-900 font-mono">{selectedTransaction.invoiceId.invoiceId}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                  <div className={`text-slate-900 font-semibold text-lg ${
                    selectedTransaction.type === "payment" ? "text-green-600" : "text-red-600"
                  }`}>
                    {selectedTransaction.type === "payment" ? "+" : "-"}₹{selectedTransaction.amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Method</label>
                  <div className="text-slate-900">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${METHOD_COLORS[selectedTransaction.paymentMethod]}`}>
                      {selectedTransaction.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="text-slate-900">
                    <span className={`inline-block px-2 py-1 rounded text-sm ${STATUS_COLORS[selectedTransaction.status]}`}>
                      {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <div className="text-slate-900 capitalize">{selectedTransaction.type}</div>
                </div>
              </div>

              {selectedTransaction.reference && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                  <div className="text-slate-900 font-mono">{selectedTransaction.reference}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
                <div className="text-slate-900">
                  {new Date(selectedTransaction.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
