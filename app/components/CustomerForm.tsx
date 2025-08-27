import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { getCustomerByPhone } from "../lib/api";

// --- TYPES ---
export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string; // legacy flat address (will mirror billing)
  city: string;
  state: string;
  zipCode: string;
  taxId: string;
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  sameShipping?: boolean; // when true shipping mirrors billing
};

// --- CUSTOMER FORM MODAL COMPONENT ---
interface CustomerFormModalProps {
  isOpen: boolean;
  customer: Customer;
  onClose: () => void;
  onUpdateCustomer: (field: keyof Customer, value: any) => void; // broaden for structured fields
  onSave?: () => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  customer,
  onClose,
  onUpdateCustomer,
  onSave,
}) => {
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [localSame, setLocalSame] = useState(customer.sameShipping ?? true);
  const phoneRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (localSame && customer.billingAddress) {
      onUpdateCustomer(
        "shippingAddress" as any,
        { ...customer.billingAddress } as any
      );
    }
  }, [localSame, customer.billingAddress]);

  // Ensure phone gets focus whenever modal opens (double attempt in case of mount timing)
  useEffect(() => {
    if (isOpen) {
      const f = () => {
        if (phoneRef.current) {
          phoneRef.current.focus();
          phoneRef.current.select();
        }
      };
      f();
      const t = setTimeout(f, 50); // fallback after paint
      return () => clearTimeout(t);
    }
  }, [isOpen]);
  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const pin = customer.billingAddress?.zipCode || customer.zipCode;
  const isFormValid =
    customer.name.trim().length > 0 && pin && pin.length === 6;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full h-full overflow-y-auto border dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Customer Information
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Number FIRST with lookup */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  ref={phoneRef}
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => {
                    setLookupMessage(null);
                    setLookupError(null);
                    onUpdateCustomer("phone", e.target.value);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      const digits = customer.phone.replace(/\D/g, "");
                      if (digits.length >= 10) {
                        setPhoneLookupLoading(true);
                        setLookupError(null);
                        setLookupMessage(null);
                        try {
                          const data = await getCustomerByPhone(customer.phone);
                          if (data) {
                            onUpdateCustomer("name", data.name || "");
                            onUpdateCustomer("email", data.email || "");
                            onUpdateCustomer(
                              "address",
                              data.address?.text || ""
                            );
                            onUpdateCustomer("city", data.address?.city || "");
                            onUpdateCustomer(
                              "state",
                              data.address?.state || ""
                            );
                            onUpdateCustomer(
                              "zipCode",
                              data.address?.zip || ""
                            );
                            setLookupMessage("Existing customer loaded");
                          } else {
                            setLookupMessage("No existing customer found");
                          }
                        } catch (err: any) {
                          setLookupError("Lookup failed");
                        } finally {
                          setPhoneLookupLoading(false);
                        }
                      }
                    }
                  }}
                  onBlur={async () => {
                    if (
                      customer.phone &&
                      customer.phone.replace(/\D/g, "").length >= 10
                    ) {
                      setPhoneLookupLoading(true);
                      setLookupError(null);
                      setLookupMessage(null);
                      try {
                        const data = await getCustomerByPhone(customer.phone);
                        if (data) {
                          onUpdateCustomer("name", data.name || "");
                          onUpdateCustomer("email", data.email || "");
                          onUpdateCustomer("address", data.address?.text || "");
                          onUpdateCustomer("city", data.address?.city || "");
                          onUpdateCustomer("state", data.address?.state || "");
                          onUpdateCustomer("zipCode", data.address?.zip || "");
                          setLookupMessage("Existing customer loaded");
                        } else {
                          setLookupMessage("No existing customer found");
                        }
                      } catch (e: any) {
                        setLookupError("Lookup failed");
                      } finally {
                        setPhoneLookupLoading(false);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {phoneLookupLoading && (
                  <span className="text-xs text-gray-500 self-center">
                    Searching...
                  </span>
                )}
              </div>
              {lookupError && (
                <p className="text-xs text-red-500 mt-1">{lookupError}</p>
              )}
              {lookupMessage && !lookupError && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {lookupMessage}
                </p>
              )}
            </div>
            {/* Customer Name - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => onUpdateCustomer("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter customer name"
                required
              />
            </div>
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => onUpdateCustomer("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="customer@example.com"
              />
            </div>

            {/* GST Number (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GST Number (optional)
              </label>
              <input
                type="text"
                value={customer.taxId}
                onChange={(e) =>
                  onUpdateCustomer("taxId", e.target.value.toUpperCase())
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                15-digit GST identification number if applicable.
              </p>
            </div>

            {/* Billing Address */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Billing Address
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PIN <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={customer.billingAddress?.zipCode || customer.zipCode}
                    required
                    maxLength={6}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const billing = {
                        ...(customer.billingAddress || {}),
                        zipCode: v,
                      };
                      onUpdateCustomer("billingAddress", billing);
                      onUpdateCustomer("zipCode", v);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    placeholder="6-digit PIN"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Street
                  </label>
                  <input
                    value={customer.billingAddress?.address || customer.address}
                    onChange={(e) => {
                      const billing = {
                        ...(customer.billingAddress || {}),
                        address: e.target.value,
                      };
                      onUpdateCustomer("billingAddress", billing);
                      onUpdateCustomer("address", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    value={customer.billingAddress?.city || customer.city}
                    onChange={(e) => {
                      const billing = {
                        ...(customer.billingAddress || {}),
                        city: e.target.value,
                      };
                      onUpdateCustomer("billingAddress", billing);
                      onUpdateCustomer("city", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    State
                  </label>
                  <input
                    value={customer.billingAddress?.state || customer.state}
                    onChange={(e) => {
                      const billing = {
                        ...(customer.billingAddress || {}),
                        state: e.target.value,
                      };
                      onUpdateCustomer("billingAddress", billing);
                      onUpdateCustomer("state", e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Shipping toggle */}
            <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={localSame}
                onChange={(e) => {
                  setLocalSame(e.target.checked);
                  onUpdateCustomer(
                    "sameShipping" as any,
                    e.target.checked as any
                  );
                }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Shipping address same as billing
              </span>
            </div>

            {!localSame && (
              <div className="col-span-1 md:col-span-2 mt-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Shipping Address
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Street
                    </label>
                    <input
                      value={customer.shippingAddress?.address || ""}
                      onChange={(e) =>
                        onUpdateCustomer("shippingAddress", {
                          ...(customer.shippingAddress || {}),
                          address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      value={customer.shippingAddress?.city || ""}
                      onChange={(e) =>
                        onUpdateCustomer("shippingAddress", {
                          ...(customer.shippingAddress || {}),
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <input
                      value={customer.shippingAddress?.state || ""}
                      onChange={(e) =>
                        onUpdateCustomer("shippingAddress", {
                          ...(customer.shippingAddress || {}),
                          state: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PIN
                    </label>
                    <input
                      value={customer.shippingAddress?.zipCode || ""}
                      maxLength={6}
                      onChange={(e) =>
                        onUpdateCustomer("shippingAddress", {
                          ...(customer.shippingAddress || {}),
                          zipCode: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Validation Message */}
          {!isFormValid && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">Required:</span> Customer name and
                6-digit PIN are required to save.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFormValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            }`}
          >
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFormModal;
