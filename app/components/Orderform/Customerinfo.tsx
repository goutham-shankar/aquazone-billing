import React, { useState } from 'react';
import { CustomerInfo } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Search, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Mail,
  User,
  MapPin,
  Phone,
  StickyNote
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ 
  customerInfo, 
  onCustomerInfoChange 
}) => {
  const [focused, setFocused] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [mobileSearchTerm, setMobileSearchTerm] = useState('');
  const [showMobileHelp, setShowMobileHelp] = useState(false);

  // Validate a specific field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'mobile':
        return !value ? 'Mobile number is required' : 
               !/^\d{10}$/.test(value) ? 'Please enter a valid 10-digit mobile number' : '';
      case 'name':
        return !value.trim() ? 'Name is required' : '';
      case 'address':
        return !value.trim() ? 'Address is required' : '';
      case 'email':
        return value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 
               'Please enter a valid email address' : '';
      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Update customerInfo state in parent
    onCustomerInfoChange({
      ...customerInfo,
      [name]: value
    });
    
    // Validate field on change if it's been touched
    if (touched[name]) {
      const errorMsg = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: errorMsg
      }));
    }
  };

  // Handle mobile search input
  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileSearchTerm(e.target.value);
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFocused(null);
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur
    const errorMsg = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  // Handle focus
  const handleFocus = (field: string) => {
    setFocused(field);
  };

  // Perform customer lookup by mobile number
  const handleLookupCustomer = () => {
    if (!mobileSearchTerm) {
      setErrors(prev => ({
        ...prev,
        mobileSearch: 'Please enter a mobile number to search'
      }));
      return;
    }
    
    // Here you would typically make an API call to search for customers
    // For now, we'll just update the mobile field and clear the search
    onCustomerInfoChange({
      ...customerInfo,
      mobile: mobileSearchTerm
    });
    setMobileSearchTerm('');
    
    // Show success message
    setErrors(prev => ({
      ...prev,
      mobileSearch: ''
    }));
  };

  // Add new customer from mobile search
  const handleAddNewCustomer = () => {
    if (!mobileSearchTerm) {
      setErrors(prev => ({
        ...prev,
        mobileSearch: 'Please enter a mobile number first'
      }));
      return;
    }
    
    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileSearchTerm)) {
      setErrors(prev => ({
        ...prev,
        mobileSearch: 'Please enter a valid 10-digit mobile number'
      }));
      return;
    }
    
    // Clear previous form data and set new mobile
    onCustomerInfoChange({
      name: '',
      address: '',
      email: '',
      mobile: mobileSearchTerm,
      notes: ''
    });
    
    setMobileSearchTerm('');
    setTouched({});
    
    // Focus the name field for a smoother user experience
    setTimeout(() => {
      const nameInput = document.getElementById('customer-name');
      if (nameInput) nameInput.focus();
    }, 100);
  };

  // Get input status class based on validation and focus
  const getInputStatusClass = (field: string) => {
    if (errors[field] && touched[field]) return 'border-red-500 focus:border-red-500 focus:ring-red-500';
    if (touched[field] && !errors[field]) return 'border-green-500 focus:border-green-500 focus:ring-green-500';
    if (focused === field) return 'border-blue-500 focus:border-blue-500 focus:ring-blue-500';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Customer Information</h3>
      
      {/* Mobile Search with Animation */}
      <div className="mb-6">
        <div className="relative">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <Phone className="w-4 h-4 mr-1 text-gray-500" />
            <span>Find Customer by Mobile:</span>
            <Tooltip
              content="Enter a customer's mobile number to search or add a new customer"
              position="right"
            >
              <button
                type="button"
                className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Help with mobile search"
                onClick={() => setShowMobileHelp(!showMobileHelp)}
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </label>
          
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                id="mobile-search"
                value={mobileSearchTerm}
                onChange={handleMobileSearchChange}
                placeholder="Enter 10-digit mobile number"
                className={`w-full px-4 py-2.5 rounded-l-md border ${
                  errors.mobileSearch ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-opacity-50 transition-all duration-200`}
                maxLength={10}
                onFocus={() => handleFocus('mobileSearch')}
                onBlur={() => setFocused(null)}
              />
              
              <AnimatePresence>
                {focused === 'mobileSearch' && (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-0 left-4 transform -translate-y-1/2 text-xs font-medium text-blue-500 bg-white px-1"
                  >
                    Mobile Number
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            
            <button
              type="button"
              onClick={handleLookupCustomer}
              className="group flex items-center justify-center p-2.5 bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 rounded-none"
              aria-label="Search customer"
            >
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            
            <button
              type="button"
              onClick={handleAddNewCustomer}
              className="group flex items-center justify-center p-2.5 bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 rounded-r-md"
              aria-label="Add new customer"
            >
              <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Mobile Search Error/Help Message */}
          <AnimatePresence>
            {errors.mobileSearch && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.mobileSearch}</span>
              </motion.p>
            )}
            
            {showMobileHelp && !errors.mobileSearch && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 text-sm text-gray-500 bg-blue-50 p-2 rounded-md"
              >
                <ul className="list-disc pl-5 space-y-1">
                  <li>Enter a 10-digit mobile number to search for existing customers</li>
                  <li>Click the <Search className="inline h-3 w-3 text-blue-500" /> icon to look up the customer</li>
                  <li>Click the <PlusCircle className="inline h-3 w-3 text-green-500" /> icon to create a new customer with this number</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Main Customer Information Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-5">
        <div className="sm:col-span-1 lg:col-span-2">
          <div className="relative">
            <label 
              htmlFor="customer-mobile" 
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Phone className="w-4 h-4 mr-1 text-gray-500" />
              <span>Mobile:</span>
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            
            <input
              type="text"
              id="customer-mobile"
              name="mobile"
              value={customerInfo.mobile || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('mobile')}
              onBlur={handleBlur}
              className={`input-field w-full px-4 py-2.5 rounded-md border ${
                getInputStatusClass('mobile')
              } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-opacity-50 transition-all duration-200`}
              placeholder="10-digit mobile number"
              maxLength={10}
              required
              aria-describedby={errors.mobile ? "mobile-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.mobile && !errors.mobile && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute right-3 top-9 text-green-500"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {touched.mobile && errors.mobile && (
              <motion.p 
                id="mobile-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.mobile}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <div className="sm:col-span-1 lg:col-span-2">
          <div className="relative">
            <label 
              htmlFor="customer-name" 
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <User className="w-4 h-4 mr-1 text-gray-500" />
              <span>Name:</span>
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            
            <input
              type="text"
              id="customer-name"
              name="name"
              value={customerInfo.name || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              className={`input-field w-full px-4 py-2.5 rounded-md border ${
                getInputStatusClass('name')
              } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-opacity-50 transition-all duration-200`}
              placeholder="Customer name"
              required
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.name && !errors.name && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute right-3 top-9 text-green-500"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {touched.name && errors.name && (
              <motion.p 
                id="name-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.name}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <div className="sm:col-span-2 lg:col-span-2">
          <div className="relative">
            <label 
              htmlFor="customer-email" 
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <Mail className="w-4 h-4 mr-1 text-gray-500" />
              <span>Email (optional):</span>
            </label>
            
            <input
              type="email"
              id="customer-email"
              name="email"
              value={customerInfo.email || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={`input-field w-full px-4 py-2.5 rounded-md border ${
                getInputStatusClass('email')
              } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-opacity-50 transition-all duration-200`}
              placeholder="customer@example.com"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.email && !errors.email && customerInfo.email && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute right-3 top-9 text-green-500"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {touched.email && errors.email && (
              <motion.p 
                id="email-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.email}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <div className="sm:col-span-2 lg:col-span-4">
          <div className="relative">
            <label 
              htmlFor="customer-address" 
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <MapPin className="w-4 h-4 mr-1 text-gray-500" />
              <span>Address:</span>
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            
            <input
              type="text"
              id="customer-address"
              name="address"
              value={customerInfo.address || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('address')}
              onBlur={handleBlur}
              className={`input-field w-full px-4 py-2.5 rounded-md border ${
                getInputStatusClass('address')
              } focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-opacity-50 transition-all duration-200`}
              placeholder="Delivery address"
              required
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.address && !errors.address && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute right-3 top-9 text-green-500"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {touched.address && errors.address && (
              <motion.p 
                id="address-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-sm text-red-500"
              >
                <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.address}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        <div className="col-span-full">
          <div className="relative">
            <label 
              htmlFor="customer-notes" 
              className="flex items-center text-sm font-medium text-gray-700 mb-1"
            >
              <StickyNote className="w-4 h-4 mr-1 text-gray-500" />
              <span>Special Note:</span>
              <Tooltip content="Add any special delivery instructions, preferences, or allergies">
                <button
                  type="button"
                  className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </label>
            
            <textarea
              id="customer-notes"
              name="notes"
              value={customerInfo.notes || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('notes')}
              onBlur={() => setFocused(null)}
              className={`w-full px-4 py-3 rounded-md border ${
                focused === 'notes' ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-300'
              } focus:outline-none transition-all duration-200 min-h-[80px] resize-y`}
              placeholder="Enter any special instructions or notes here..."
            />
            
            <AnimatePresence>
              {focused === 'notes' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-2 right-2 text-xs text-gray-400"
                >
                  {customerInfo.notes?.length || 0} characters
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Required Fields Notice */}
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <AlertCircle className="w-4 h-4 mr-1 text-gray-400" />
        <span>Fields marked with <span className="text-red-500">*</span> are required</span>
      </div>
    </div>
  );
};

export default CustomerInfoForm;