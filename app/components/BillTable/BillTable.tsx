import React, { useState, useEffect } from 'react';
import { BillItem } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  Plus, 
  Minus, 
  Menu,
  FileText,
  Tag,
  Receipt,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Edit3,
  BookOpen,
  Hash,
  Percent,
  RefreshCw,
  Info
} from 'lucide-react';

interface BillTableProps {
  items: BillItem[];
  onQuantityChange: (id: number, newQuantity: number) => void;
  onSpecialNoteChange: (id: number, newNote: string) => void;
  onRemoveItem: (id: number) => void;
}

// Helper function to format rupee amounts
const formatRupee = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
};

// Small check icon component
const CheckIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 left-1/2 z-50 px-4 py-2 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white font-medium flex items-center`}
    >
      {type === 'success' ? (
        <CheckIcon className="h-4 w-4 mr-2" />
      ) : (
        <AlertCircle className="h-4 w-4 mr-2" />
      )}
      {message}
    </motion.div>
  );
};

const BillTable: React.FC<BillTableProps> = ({ 
  items, 
  onQuantityChange, 
  onSpecialNoteChange, 
  onRemoveItem 
}) => {
  const [showDiscounts, setShowDiscounts] = useState(false);
  const [showTaxes, setShowTaxes] = useState(false);
  const [orderComments, setOrderComments] = useState("");
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [hoveringItem, setHoveringItem] = useState<number | null>(null);
  const [animateValues, setAnimateValues] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // Add animation effect when values change
  useEffect(() => {
    if (items.length > 0) {
      setAnimateValues(true);
      const timer = setTimeout(() => setAnimateValues(false), 500);
      return () => clearTimeout(timer);
    }
  }, [items]);
  
  // Sample discount data
  const discounts = [
    { id: 1, name: "10% Off Promotion", type: "percentage", value: 10, applied: 25.50 },
    { id: 2, name: "First Order", type: "fixed", value: 5, applied: 5.00 }
  ];
  
  // Sample tax data
  const taxes = [
    { id: 1, name: "GST", rate: 18, amount: 45.10 },
    { id: 2, name: "Service Charge", rate: 5, amount: 11.27 }
  ];
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const discountTotal = discounts.reduce((sum, discount) => sum + discount.applied, 0);
  const taxTotal = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const grandTotal = subtotal - discountTotal + taxTotal;
  
  // Handle quantity change with toast notification
  const handleQuantityChange = (id: number, newQuantity: number) => {
    onQuantityChange(id, newQuantity);
    
    // Show toast when quantity changes significantly
    const item = items.find(item => item.id === id);
    if (item && Math.abs(newQuantity - item.quantity) > 1) {
      setToast({
        show: true,
        message: `Updated quantity of ${item.name} to ${newQuantity}`,
        type: 'success'
      });
    }
  };

  // Handle item removal with toast notification
  const handleRemoveItem = (id: number) => {
    const item = items.find(item => item.id === id);
    onRemoveItem(id);
    
    if (item) {
      setToast({
        show: true,
        message: `Removed ${item.name} from bill`,
        type: 'success'
      });
    }
  };
  
  return (
    <>
      <AnimatePresence>
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </AnimatePresence>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-sm overflow-hidden mb-4 border border-gray-200"
      >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-3 border-b border-primary-dark">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Order Items</h2>
          </div>
          <motion.div 
            className="text-sm bg-white/20 rounded-lg px-2 py-1"
            animate={{ scale: animateValues ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </motion.div>
        </div>
        <div className="mt-1 text-xs text-white/80 flex items-center">
          <Info className="w-3 h-3 mr-1" />
          <span>All prices in Indian Rupees (₹)</span>
        </div>
      </div>
      
      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 text-sm font-medium text-gray-600 border-b border-gray-200">
        <div className="col-span-4 sm:col-span-3 flex items-center">
          <Hash className="w-4 h-4 mr-1 text-gray-400" />
          <span>Item</span>
        </div>
        <div className="hidden sm:flex sm:col-span-5 items-center">
          <Edit3 className="w-4 h-4 mr-1 text-gray-400" />
          <span>Special Note</span>
        </div>
        <div className="col-span-2 sm:col-span-1 text-center flex items-center justify-center">
          <Hash className="w-4 h-4 mr-1 text-gray-400" />
          <span>Qty</span>
        </div>
        <div className="col-span-3 sm:col-span-1 text-right flex items-center justify-end">
          <span>Price</span>
          <Tag className="w-4 h-4 ml-1 text-gray-400" />
        </div>
        <div className="col-span-3 sm:col-span-2 text-right flex items-center justify-end">
          <span>Amount</span>
          <Tag className="w-4 h-4 ml-1 text-gray-400" />
        </div>
      </div>
      
      {/* Empty state */}
      {items.length === 0 && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Receipt className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No Items Added</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-4">
            Your bill is currently empty. Add some items to get started.
          </p>
          <motion.button 
            className="px-4 py-2 bg-primary text-white rounded-md inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Browse Menu
          </motion.button>
        </div>
      )}
      
      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              key={item.id} 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setHoveringItem(item.id)}
              onMouseLeave={() => setHoveringItem(null)}
              className={`grid grid-cols-12 gap-2 p-3 text-sm ${
                hoveringItem === item.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              } transition-colors duration-150`}
            >
              {/* Item Name & Controls */}
              <div className="col-span-4 sm:col-span-3 flex items-center group">
                <div className={`mr-2 p-1.5 rounded-md transition-colors duration-200 ${
                  hoveringItem === item.id ? 'bg-blue-100 text-primary' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Menu className="h-4 w-4" />
                </div>
                
                <div className="flex-grow">
                  <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 sm:hidden line-clamp-1">
                    {item.specialNote || "No notes"}
                  </p>
                </div>
              </div>
              
              {/* Special Note */}
              <div className="hidden sm:block sm:col-span-5">
                {editingNote === item.id ? (
                  <div className="relative">
                    <input 
                      type="text" 
                      value={item.specialNote} 
                      className="w-full border border-primary bg-white p-1.5 rounded text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      placeholder="Add special instructions..."
                      onChange={(e) => onSpecialNoteChange(item.id, e.target.value)}
                      onBlur={() => setEditingNote(null)}
                      autoFocus
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                      onClick={() => setEditingNote(null)}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingNote(item.id)}
                    className={`w-full text-left p-1.5 rounded-md ${
                      item.specialNote 
                        ? 'bg-yellow-50 text-gray-700 border border-yellow-100' 
                        : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.specialNote ? (
                        <AlertCircle className="h-3.5 w-3.5 text-yellow-500 mr-1.5 flex-shrink-0" />
                      ) : (
                        <Edit3 className="h-3.5 w-3.5 text-gray-400 mr-1.5 flex-shrink-0" />
                      )}
                      <span className="line-clamp-1">
                        {item.specialNote || "Add special instructions..."}
                      </span>
                    </div>
                  </button>
                )}
              </div>
              
              {/* Quantity */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                <div className="flex items-center border border-gray-200 rounded-md">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => item.quantity > 1 && handleQuantityChange(item.id, item.quantity - 1)}
                    className={`p-1 ${
                      item.quantity > 1 
                        ? 'text-primary hover:bg-gray-100' 
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </motion.button>
                  
                  <motion.input 
                    type="text" 
                    value={item.quantity} 
                    className="w-8 border-0 text-center text-sm font-medium focus:ring-0 p-0"
                    animate={{ scale: animateValues && hoveringItem === item.id ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val > 0) {
                        handleQuantityChange(item.id, val);
                      }
                    }}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="p-1 text-primary hover:bg-gray-100"
                  >
                    <Plus className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
              
              {/* Price */}
              <div className="col-span-3 sm:col-span-1 text-right font-medium text-gray-600">
                <motion.div
                  animate={{ scale: (animateValues && hoveringItem === item.id) ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex"
                >
                  ₹{formatRupee(item.price)}
                </motion.div>
              </div>
              
              {/* Amount & Remove */}
              <div className="col-span-3 sm:col-span-2 flex items-center justify-between">
                <motion.button 
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => onRemoveItem(item.id)}
                  className={`${
                    hoveringItem === item.id 
                      ? 'text-red-500 opacity-100' 
                      : 'text-red-400 opacity-0 sm:opacity-50'
                  } hover:text-red-600 transition-all duration-200 relative group`}
                >
                  <Trash2 className="h-4 w-4" />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Remove Item
                  </div>
                </motion.button>
                
                <motion.div 
                  className="font-medium text-gray-800"
                  animate={{ scale: animateValues ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ₹{formatRupee(item.amount)}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {items.length > 0 && (
        <>
          {/* Discounts Section */}
          <div className="border-t border-gray-200">
            <button 
              onClick={() => setShowDiscounts(!showDiscounts)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-green-500" />
                <span className="font-medium text-gray-700">Applied Discounts</span>
                {discountTotal > 0 && (
                  <motion.span 
                    className="ml-2 text-sm text-green-600 font-medium"
                    animate={{ scale: animateValues ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    -₹{formatRupee(discountTotal)}
                  </motion.span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>{showDiscounts ? 'Hide' : 'Show'} Detail</span>
                {showDiscounts ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </button>
            
            <AnimatePresence>
              {showDiscounts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  {discounts.length > 0 ? (
                    <div className="p-3 space-y-2">
                      {discounts.map(discount => (
                        <div key={discount.id} className="flex justify-between items-center p-2 bg-white rounded-md border border-gray-100">
                          <div className="flex items-start">
                            <div className="bg-green-100 p-1.5 rounded text-green-600 mr-2">
                              {discount.type === 'percentage' ? (
                                <Percent className="h-4 w-4" />
                              ) : (
                                <Tag className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{discount.name}</div>
                              <div className="text-xs text-gray-500">
                                {discount.type === 'percentage' ? `${discount.value}% off` : `₹${formatRupee(discount.value)} off`}
                              </div>
                            </div>
                          </div>
                          <motion.div 
                            className="text-green-600 font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            -₹{formatRupee(discount.applied)}
                          </motion.div>
                        </div>
                      ))}
                      
                      <motion.button 
                        className="flex items-center justify-center w-full py-1.5 text-sm text-primary hover:text-primary-dark"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Discount
                      </motion.button>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500 mb-2">No discounts applied</p>
                      <motion.button 
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-md text-primary hover:bg-gray-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Add Discount
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Taxes Section */}
          <div className="border-t border-gray-200">
            <button 
              onClick={() => setShowTaxes(!showTaxes)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Receipt className="h-4 w-4 mr-2 text-blue-500" />
                <span className="font-medium text-gray-700">Applied Taxes</span>
                {taxTotal > 0 && (
                  <motion.span 
                    className="ml-2 text-sm text-gray-600 font-medium"
                    animate={{ scale: animateValues ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    +₹{formatRupee(taxTotal)}
                  </motion.span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <span>{showTaxes ? 'Hide' : 'Show'} Detail</span>
                {showTaxes ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </div>
            </button>
            
            <AnimatePresence>
              {showTaxes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden bg-gray-50 border-t border-gray-100"
                >
                  {taxes.length > 0 ? (
                    <div className="p-3 space-y-2">
                      {taxes.map(tax => (
                        <div key={tax.id} className="flex justify-between items-center p-2 bg-white rounded-md border border-gray-100">
                          <div className="flex items-start">
                            <div className="bg-blue-100 p-1.5 rounded text-blue-600 mr-2">
                              <Percent className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{tax.name}</div>
                              <div className="text-xs text-gray-500">{tax.rate}% on applicable items</div>
                            </div>
                          </div>
                          <motion.div 
                            className="text-gray-700 font-medium"
                            whileHover={{ scale: 1.05 }}
                          >
                            +₹{formatRupee(tax.amount)}
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-500">No taxes applied</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Order Comments */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-2">
              <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
              <label className="text-sm font-medium text-gray-700">Order Comments</label>
            </div>
            
            <textarea 
              value={orderComments}
              onChange={(e) => setOrderComments(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:ring-primary focus:border-primary min-h-[80px] resize-y placeholder-gray-400"
              placeholder="Enter any special instructions or notes for the entire order..."
            ></textarea>
          </div>
          
          {/* Summary */}
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <motion.span 
                  className="font-medium text-gray-800"
                  animate={{ scale: animateValues ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ₹{formatRupee(subtotal)}
                </motion.span>
              </div>
              
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <motion.span
                  animate={{ scale: animateValues ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  -₹{formatRupee(discountTotal)}
                </motion.span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <motion.span 
                  className="font-medium text-gray-800"
                  animate={{ scale: animateValues ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  ₹{formatRupee(taxTotal)}
                </motion.span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                <span className="font-medium text-gray-800">Total:</span>
                <motion.span 
                  className="font-bold text-primary text-lg"
                  animate={{ scale: animateValues ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.5 }}
                >
                  ₹{formatRupee(grandTotal)}
                </motion.span>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
    </>
  );
};

export default BillTable;