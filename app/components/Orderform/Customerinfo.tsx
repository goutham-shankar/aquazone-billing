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
  compact?: boolean; // Add support for compact mode
}

interface ValidationErrors {
  [key: string]: string;
}

// Update CustomerInfo type to include optional fields from your implementation
declare module '../../types' {
  interface CustomerInfo {
    name: string;
    address: string;
    email: string;
    mobile?: string;
    notes?: string;
  }
}

const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ 
  customerInfo, 
  onCustomerInfoChange,
  compact = false
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
    if (errors[field] && touched[field]) return 'border-red-400 bg-red-50 focus:border-red-500';
    if (touched[field] && !errors[field]) return 'border-green-400 bg-green-50 focus:border-green-500';
    if (focused === field) return 'border-blue-400 bg-blue-50 focus:border-blue-500';
    return 'border-gray-300 bg-gray-50 focus:border-blue-400 hover:border-gray-400';
  };

  // If compact mode is enabled, render a more condensed form
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <input
              type="text"
              id="customer-mobile-compact"
              name="mobile"
              value={customerInfo.mobile || ''}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Mobile *"
            />
          </div>
          <div className="relative">
            <input
              type="text"
              id="customer-name-compact"
              name="name"
              value={customerInfo.name || ''}
              onChange={handleChange}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Name *"
            />
          </div>
        </div>
        <div className="relative">
          <input
            type="email"
            id="customer-email-compact"
            name="email"
            value={customerInfo.email || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Email (optional)"
          />
        </div>
        <div className="relative">
          <input
            type="text"
            id="customer-address-compact"
            name="address"
            value={customerInfo.address || ''}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Address *"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl shadow-lg p-4 border border-blue-100 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center mb-4"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-md">
          <h3 className="text-lg font-bold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Customer Details
          </h3>
        </div>
      </motion.div>
      
      {/* Mobile Search with Fun Animation */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative bg-white rounded-lg p-3 shadow-sm border border-blue-200">
          <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <div className="bg-blue-100 p-1 rounded-full mr-2">
              <Phone className="w-3 h-3 text-blue-600" />
            </div>
            <span>Quick Customer Search:</span>
            <Tooltip
              content="🔍 Search by mobile or add new customer instantly!"
              position="right"
            >
              <motion.button
                type="button"
                className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Help with mobile search"
                onClick={() => setShowMobileHelp(!showMobileHelp)}
              >
                <HelpCircle className="w-4 h-4" />
              </motion.button>
            </Tooltip>
          </label>
          
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                id="mobile-search"
                value={mobileSearchTerm}
                onChange={handleMobileSearchChange}
                placeholder="📱 Enter mobile number..."
                className={`w-full px-3 py-2 rounded-lg border-2 ${
                  errors.mobileSearch ? 'border-red-300 bg-red-50' : 'border-blue-200 bg-blue-50'
                } focus:outline-none focus:border-blue-400 focus:bg-white transition-all duration-300 text-sm`}
                maxLength={10}
                onFocus={() => handleFocus('mobileSearch')}
                onBlur={() => setFocused(null)}
              />
              
              <AnimatePresence>
                {focused === 'mobileSearch' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute -top-2 left-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
                  >
                    ✨ Mobile Search
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button
              type="button"
              onClick={handleLookupCustomer}
              className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-lg shadow-md transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Search customer"
            >
              <Search className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              type="button"
              onClick={handleAddNewCustomer}
              className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 rounded-lg shadow-md transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Add new customer"
            >
              <PlusCircle className="h-4 w-4" />
            </motion.button>
          </div>
          
          {/* Mobile Search Error/Help Message */}
          <AnimatePresence>
            {errors.mobileSearch && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200"
              >
                <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{errors.mobileSearch}</span>
              </motion.div>
            )}
            
            {showMobileHelp && !errors.mobileSearch && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mt-2 text-sm text-blue-700 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200"
              >
                <div className="flex items-center mb-2">
                  <span className="text-lg mr-2">💡</span>
                  <span className="font-semibold">Quick Tips:</span>
                </div>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <span className="text-blue-500 mr-2">🔍</span>
                    Enter 10-digit mobile to find existing customers
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">➕</span>
                    Click plus to create new customer profile
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Main Customer Information Form */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Mobile Field */}
        <div className="relative">
          <motion.div 
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-purple-200 hover:border-purple-300 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <label 
              htmlFor="customer-mobile" 
              className="flex items-center text-sm font-semibold text-gray-700 mb-1"
            >
              <div className="bg-purple-100 p-1 rounded-full mr-2">
                <Phone className="w-3 h-3 text-purple-600" />
              </div>
              <span>📱 Mobile</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            <input
              type="text"
              id="customer-mobile"
              name="mobile"
              value={customerInfo.mobile || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('mobile')}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-lg border-2 ${
                getInputStatusClass('mobile')
              } focus:outline-none transition-all duration-300 text-sm`}
              placeholder="1234567890"
              maxLength={10}
              required
              aria-describedby={errors.mobile ? "mobile-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.mobile && !errors.mobile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-2 right-2 text-green-500 bg-green-100 rounded-full p-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <AnimatePresence>
            {touched.mobile && errors.mobile && (
              <motion.p 
                id="mobile-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.mobile}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Name Field */}
        <div className="relative">
          <motion.div 
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-green-200 hover:border-green-300 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <label 
              htmlFor="customer-name" 
              className="flex items-center text-sm font-semibold text-gray-700 mb-1"
            >
              <div className="bg-green-100 p-1 rounded-full mr-2">
                <User className="w-3 h-3 text-green-600" />
              </div>
              <span>👤 Name</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            <input
              type="text"
              id="customer-name"
              name="name"
              value={customerInfo.name || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-lg border-2 ${
                getInputStatusClass('name')
              } focus:outline-none transition-all duration-300 text-sm`}
              placeholder="John Doe"
              required
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.name && !errors.name && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-2 right-2 text-green-500 bg-green-100 rounded-full p-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <AnimatePresence>
            {touched.name && errors.name && (
              <motion.p 
                id="name-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.name}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {/* Email Field - Full Width */}
        <div className="relative md:col-span-2">
          <motion.div 
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-orange-200 hover:border-orange-300 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <label 
              htmlFor="customer-email" 
              className="flex items-center text-sm font-semibold text-gray-700 mb-1"
            >
              <div className="bg-orange-100 p-1 rounded-full mr-2">
                <Mail className="w-3 h-3 text-orange-600" />
              </div>
              <span>📧 Email (optional)</span>
            </label>
            
            <input
              type="email"
              id="customer-email"
              name="email"
              value={customerInfo.email || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-lg border-2 ${
                getInputStatusClass('email')
              } focus:outline-none transition-all duration-300 text-sm`}
              placeholder="john@example.com"
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.email && !errors.email && customerInfo.email && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-2 right-2 text-green-500 bg-green-100 rounded-full p-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <AnimatePresence>
            {touched.email && errors.email && (
              <motion.p 
                id="email-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.email}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Address Field - Full Width */}
        <div className="relative md:col-span-2">
          <motion.div 
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-teal-200 hover:border-teal-300 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <label 
              htmlFor="customer-address" 
              className="flex items-center text-sm font-semibold text-gray-700 mb-1"
            >
              <div className="bg-teal-100 p-1 rounded-full mr-2">
                <MapPin className="w-3 h-3 text-teal-600" />
              </div>
              <span>🏠 Address</span>
              <span className="text-red-500 ml-1">*</span>
            </label>
            
            <input
              type="text"
              id="customer-address"
              name="address"
              value={customerInfo.address || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('address')}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 rounded-lg border-2 ${
                getInputStatusClass('address')
              } focus:outline-none transition-all duration-300 text-sm`}
              placeholder="123 Main St, City"
              required
              aria-describedby={errors.address ? "address-error" : undefined}
            />
            
            <AnimatePresence>
              {touched.address && !errors.address && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-2 right-2 text-green-500 bg-green-100 rounded-full p-1"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <AnimatePresence>
            {touched.address && errors.address && (
              <motion.p 
                id="address-error"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg"
              >
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errors.address}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        
        {/* Notes Field - Full Width */}
        <div className="relative md:col-span-2">
          <motion.div 
            className="bg-white rounded-lg p-3 shadow-sm border-2 border-pink-200 hover:border-pink-300 transition-all duration-300"
            whileHover={{ y: -2 }}
          >
            <label 
              htmlFor="customer-notes" 
              className="flex items-center text-sm font-semibold text-gray-700 mb-1"
            >
              <div className="bg-pink-100 p-1 rounded-full mr-2">
                <StickyNote className="w-3 h-3 text-pink-600" />
              </div>
              <span>📝 Special Notes</span>
              <Tooltip content="💡 Add delivery instructions, preferences, or allergies">
                <motion.button
                  type="button"
                  className="ml-2 text-pink-400 hover:text-pink-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </motion.button>
              </Tooltip>
            </label>
            
            <textarea
              id="customer-notes"
              name="notes"
              value={customerInfo.notes || ''}
              onChange={handleChange}
              onFocus={() => handleFocus('notes')}
              onBlur={() => setFocused(null)}
              className={`w-full px-3 py-2 rounded-lg border-2 ${
                focused === 'notes' ? 'border-pink-400 bg-pink-50' : 'border-pink-200 bg-pink-50'
              } focus:outline-none transition-all duration-300 min-h-[60px] resize-y text-sm`}
              placeholder="Any special instructions? (allergies, delivery notes, etc.)"
            />
            
            <AnimatePresence>
              {focused === 'notes' && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-2 right-3 text-xs text-pink-500 bg-white px-2 py-1 rounded-full shadow-sm"
                >
                  {customerInfo.notes?.length || 0} chars
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Fun Required Fields Notice */}
      <motion.div 
        className="mt-4 flex items-center justify-center text-sm text-gray-600 bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-lg border border-red-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center">
          <span className="text-lg mr-2">⚡</span>
          <AlertCircle className="w-4 h-4 mr-2 text-red-400" />
          <span>Fields with <span className="text-red-500 font-semibold">*</span> are required for order processing</span>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerInfoForm;