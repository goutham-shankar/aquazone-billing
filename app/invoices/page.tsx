"use client";
import { useState, useEffect } from "react";
import { Search, FileText, Download, Eye, Calendar, Filter } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Invoice {
  _id: string;
  amount: {
    subTotal: number;
    tax: number;
    total: number;
  };
  address: {
    billing: {
      text: string;
      city: string;
      state: string;
      zip: string;
    },
    shipping: {
      text: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  customer: {
    _id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  invoiceId: string;
  type: "estimate" | "bill";
  status?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [typeFilter, dateRange]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      const response = await api.invoices.list(params);
      if (response.success) {
        setInvoices(response.data || []);
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
    
      toast.success("Invoice downloaded");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case "estimate":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300";
      case "bill":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      default:
        return "bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-300";
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Invoices</h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
          >
            <option value="all">All Types</option>
            <option value="bill">Bills</option>
            <option value="estimate">Estimates</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Invoice List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-slate-500 dark:text-gray-400">Loading invoices...</div>
        ) : invoices.length > 0 ? (
          <div className="divide-y divide-slate-200 dark:divide-gray-700">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="p-6 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-sky-100 dark:bg-sky-900/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Invoice #{invoice.invoiceId}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.type)}`}>
                          {invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-slate-600 dark:text-gray-400 mt-1">
                        {invoice.customer.name} • {invoice.customer.phone}
                      </div>
                      
                      <div className="text-sm text-slate-500 dark:text-gray-500 mt-1">
                        {new Date(invoice.createdAt).toLocaleDateString()} • {invoice.items.length} items
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900 dark:text-gray-100">
                      ₹{invoice.amount.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-gray-400">
                      (Tax: ₹{invoice.amount.tax.toFixed(2)})
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => viewInvoiceDetails(invoice)}
                      className="p-2 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => downloadInvoice(invoice._id)}
                      className="p-2 text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-gray-400">No invoices found</div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showDetails && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Invoice #{selectedInvoice._id.slice(-6)}
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-md text-gray-500 dark:text-gray-400"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Customer Details</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div>{selectedInvoice.customer.name}</div>
                    <div>{selectedInvoice.customer.phone}</div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2">Invoice Details</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div>Type: {selectedInvoice.type.charAt(0).toUpperCase() + selectedInvoice.type.slice(1)}</div>
                    <div>Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</div>
                    <div>Items: {selectedInvoice.items.length}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-800 dark:text-gray-100 mb-3">Items</h3>
                <div className="border border-slate-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-gray-750">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-slate-700 dark:text-gray-300">Item</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-gray-300">Price</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-gray-300">Qty</th>
                        <th className="text-right p-3 text-sm font-medium text-slate-700 dark:text-gray-300">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-gray-700">
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-800">
                          <td className="p-3 text-sm text-gray-900 dark:text-white">{item.name}</td>
                          <td className="p-3 text-sm text-right text-gray-900 dark:text-white">₹{item.price.toFixed(2)}</td>
                          <td className="p-3 text-sm text-right text-gray-900 dark:text-white">{item.quantity}</td>
                          <td className="p-3 text-sm text-right text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="max-w-sm ml-auto space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{selectedInvoice.amount.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{selectedInvoice.amount.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedInvoice.amount.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-750 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-md hover:bg-slate-50 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={() => downloadInvoice(selectedInvoice._id)}
                className="px-4 py-2 bg-sky-600 dark:bg-sky-700 text-white rounded-md hover:bg-sky-700 dark:hover:bg-sky-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
