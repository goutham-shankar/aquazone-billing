"use client";
import { useState, useEffect } from "react";
import { Search, User, Plus, Edit, Trash2, Eye, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: {
    text?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers();
      } else {
        loadCustomers();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.customers.search({ limit: 50 });
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.customers.search({ 
        q: searchQuery,
        limit: 50 
      });
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
      toast.error("Failed to search customers");
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Customers</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="grid gap-4">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                      <div className="text-sm text-slate-600">
                        {customer.phone} {customer.email && `• ${customer.email}`}
                      </div>
                      {customer.address?.city && (
                        <div className="text-sm text-slate-500">
                          {customer.address.city}, {customer.address.state}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewCustomerDetails(customer)}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Customer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {searchQuery ? "No customers found for your search" : "No customers available"}
          </div>
        )}
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Customer Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <div className="text-slate-900">{selectedCustomer.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="text-slate-900">{selectedCustomer.phone}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <div className="text-slate-900">{selectedCustomer.email || "Not provided"}</div>
                </div>
              </div>

              {selectedCustomer.address && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <div className="text-slate-900 space-y-1">
                    {selectedCustomer.address.text && <div>{selectedCustomer.address.text}</div>}
                    <div>
                      {selectedCustomer.address.city && selectedCustomer.address.city}
                      {selectedCustomer.address.state && `, ${selectedCustomer.address.state}`}
                      {selectedCustomer.address.zip && ` - ${selectedCustomer.address.zip}`}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Member Since</label>
                <div className="text-slate-900">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
