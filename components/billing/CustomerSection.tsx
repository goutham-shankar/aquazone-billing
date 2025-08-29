"use client";
import { useState, useEffect } from "react";
import { Search, User, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  billingAddress?: {
    text?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  shippingAddress?: {
    text?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

interface CustomerSectionProps {
  className?: string;
  customer?: Customer;
  onCustomerSelect: (customer: Customer) => void;
  onClear: () => void;
}

export default function CustomerSection({ className, customer, onCustomerSelect, onClear }: CustomerSectionProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: "",
    billingAddress: {
      text: "",
      city: "",
      state: "",
      zip: ""
    },
    shippingAddress: {
      text: "",
      city: "",
      state: "",
      zip: ""
    }
  });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    if (customer) {
      setCustomerForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        billingAddress: {
          text: customer.billingAddress?.text || "",
          city: customer.billingAddress?.city || "",
          state: customer.billingAddress?.state || "",
          zip: customer.billingAddress?.zip || ""
        },
        shippingAddress: {
          text: customer.shippingAddress?.text || "",
          city: customer.shippingAddress?.city || "",
          state: customer.shippingAddress?.state || "",
          zip: customer.shippingAddress?.zip || ""
        }
      });
      setPhoneNumber(customer.phone || "");
      setShowForm(true);
      // Check if shipping address is same as billing
      const billing = customer.billingAddress;
      const shipping = customer.shippingAddress;
      const isSame = billing && shipping && 
        billing.text === shipping.text &&
        billing.city === shipping.city &&
        billing.state === shipping.state &&
        billing.zip === shipping.zip;
      setSameAsBilling(isSame || !shipping?.text);
    } else {
      setShowForm(false);
      setPhoneNumber("");
      setSameAsBilling(true);
      setCustomerForm({
        name: "",
        email: "",
        phone: "",
        billingAddress: { text: "", city: "", state: "", zip: "" },
        shippingAddress: { text: "", city: "", state: "", zip: "" }
      });
    }
  }, [customer]);

  const searchCustomer = async () => {
    if (!phoneNumber.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.customers.get({ phone: phoneNumber });
      if (response.success && response.data) {
        const customerData = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          billingAddress: response.data.address || response.data.billingAddress,
          shippingAddress: response.data.shippingAddress || response.data.address
        };
        onCustomerSelect(customerData);
        toast.success("Customer found and loaded");
      } else {
        // Customer not found, show form to create new
        setCustomerForm(prev => ({ ...prev, phone: phoneNumber }));
        setShowForm(true);
        toast("Customer not found. Please fill details to create new customer.");
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      // Show form for new customer creation on error
      setCustomerForm(prev => ({ ...prev, phone: phoneNumber }));
      setShowForm(true);
      toast("Unable to search customers. Please create new customer.");
    } finally {
      setLoading(false);
    }
  };

  const saveCustomer = async () => {
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }

    // Use shipping address if not same as billing
    const shippingAddr = sameAsBilling ? customerForm.billingAddress : customerForm.shippingAddress;

    setLoading(true);
    try {
      const response = await api.customers.create({
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email || undefined,
        billingAddress: {
          text: customerForm.billingAddress.text || undefined,
          city: customerForm.billingAddress.city || undefined,
          state: customerForm.billingAddress.state || undefined,
          zip: customerForm.billingAddress.zip || undefined
        },
        shippingAddress: {
          text: shippingAddr.text || undefined,
          city: shippingAddr.city || undefined,
          state: shippingAddr.state || undefined,
          zip: shippingAddr.zip || undefined
        }
      });

      if (response.success && response.data) {
        const customerData = {
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          billingAddress: response.data.billingAddress || response.data.address,
          shippingAddress: response.data.shippingAddress || response.data.address
        };
        onCustomerSelect(customerData);
        toast.success("Customer created successfully");
      } else {
        console.error("Failed to create customer:", (response as any).error);
        toast.error("Failed to create customer");
      }
    } catch (error: any) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <User className="w-4 h-4" />
          Customer Details
        </h3>
        {customer && (
          <button
            onClick={onClear}
            className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
            title="Clear customer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!showForm && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="Enter phone number"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchCustomer()}
            />
            <button
              onClick={searchCustomer}
              disabled={loading || !phoneNumber.trim()}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? "..." : "Search"}
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Enter customer phone number to search or create new customer
          </p>
        </div>
      )}

      {showForm && (
        <div className="space-y-4 flex-1">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name *"
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={customerForm.name}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
            />
            <input
              type="tel"
              placeholder="Phone *"
              className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={customerForm.phone}
              onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <input
            type="email"
            placeholder="Email"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={customerForm.email}
            onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
          />
          
          {/* Billing Address */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Billing Address</h4>
            <textarea
              placeholder="Billing Address"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 h-16 resize-none"
              value={customerForm.billingAddress.text}
              onChange={(e) => setCustomerForm(prev => ({ 
                ...prev, 
                billingAddress: { ...prev.billingAddress, text: e.target.value },
                ...(sameAsBilling && { shippingAddress: { ...prev.billingAddress, text: e.target.value } })
              }))}
            />
            
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={customerForm.billingAddress.city}
                onChange={(e) => setCustomerForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, city: e.target.value },
                  ...(sameAsBilling && { shippingAddress: { ...prev.billingAddress, city: e.target.value } })
                }))}
              />
              <input
                type="text"
                placeholder="State"
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={customerForm.billingAddress.state}
                onChange={(e) => setCustomerForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, state: e.target.value },
                  ...(sameAsBilling && { shippingAddress: { ...prev.billingAddress, state: e.target.value } })
                }))}
              />
              <input
                type="text"
                placeholder="PIN"
                className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={customerForm.billingAddress.zip}
                onChange={(e) => setCustomerForm(prev => ({ 
                  ...prev, 
                  billingAddress: { ...prev.billingAddress, zip: e.target.value },
                  ...(sameAsBilling && { shippingAddress: { ...prev.billingAddress, zip: e.target.value } })
                }))}
              />
            </div>
          </div>

          {/* Same as Billing Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sameAsBilling"
              checked={sameAsBilling}
              onChange={(e) => {
                setSameAsBilling(e.target.checked);
                if (e.target.checked) {
                  setCustomerForm(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.billingAddress }
                  }));
                }
              }}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="sameAsBilling" className="text-sm text-slate-700">
              Shipping address same as billing address
            </label>
          </div>

          {/* Shipping Address - only show if not same as billing */}
          {!sameAsBilling && (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">Shipping Address</h4>
              <textarea
                placeholder="Shipping Address"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400 h-16 resize-none"
                value={customerForm.shippingAddress.text}
                onChange={(e) => setCustomerForm(prev => ({ 
                  ...prev, 
                  shippingAddress: { ...prev.shippingAddress, text: e.target.value }
                }))}
              />
              
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={customerForm.shippingAddress.city}
                  onChange={(e) => setCustomerForm(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.shippingAddress, city: e.target.value }
                  }))}
                />
                <input
                  type="text"
                  placeholder="State"
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={customerForm.shippingAddress.state}
                  onChange={(e) => setCustomerForm(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.shippingAddress, state: e.target.value }
                  }))}
                />
                <input
                  type="text"
                  placeholder="PIN"
                  className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                  value={customerForm.shippingAddress.zip}
                  onChange={(e) => setCustomerForm(prev => ({ 
                    ...prev, 
                    shippingAddress: { ...prev.shippingAddress, zip: e.target.value }
                  }))}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {!customer && (
              <button
                onClick={saveCustomer}
                disabled={loading || !customerForm.name.trim() || !customerForm.phone.trim()}
                className="flex-1 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Customer"}
              </button>
            )}
            <button
              onClick={() => {
                setShowForm(false);
                setPhoneNumber("");
                onClear();
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
