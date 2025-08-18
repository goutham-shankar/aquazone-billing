import React from 'react';
import { X } from 'lucide-react';

// --- TYPES ---
export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  taxId: string;
};

// --- CUSTOMER FORM MODAL COMPONENT ---
interface CustomerFormModalProps {
  isOpen: boolean;
  customer: Customer;
  onClose: () => void;
  onUpdateCustomer: (field: keyof Customer, value: string) => void;
  onSave?: () => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ 
  isOpen, 
  customer, 
  onClose, 
  onUpdateCustomer,
  onSave
}) => {
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

  const isFormValid = customer.name.trim().length > 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border dark:border-gray-700">
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
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={customer.name} 
                onChange={(e) => onUpdateCustomer('name', e.target.value)} 
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
                onChange={(e) => onUpdateCustomer('email', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="customer@example.com" 
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input 
                type="tel" 
                value={customer.phone} 
                onChange={(e) => onUpdateCustomer('phone', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="+91 98765 43210" 
              />
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GST Number
              </label>
              <input 
                type="text" 
                value={customer.taxId} 
                onChange={(e) => onUpdateCustomer('taxId', e.target.value.toUpperCase())} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono" 
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                15-digit GST identification number
              </p>
            </div>

            {/* Street Address - Full Width */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <input 
                type="text" 
                value={customer.address} 
                onChange={(e) => onUpdateCustomer('address', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="Enter street address" 
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                City
              </label>
              <input 
                type="text" 
                value={customer.city} 
                onChange={(e) => onUpdateCustomer('city', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="City" 
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input 
                type="text" 
                value={customer.state} 
                onChange={(e) => onUpdateCustomer('state', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="State" 
              />
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                PIN Code
              </label>
              <input 
                type="text" 
                value={customer.zipCode} 
                onChange={(e) => onUpdateCustomer('zipCode', e.target.value.replace(/\D/g, ''))} 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                placeholder="400001"
                maxLength={6}
                pattern="[0-9]{6}"
              />
            </div>
          </div>

          {/* Form Validation Message */}
          {!isFormValid && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-medium">Required:</span> Customer name is required to save.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
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
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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