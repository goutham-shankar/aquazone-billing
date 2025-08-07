import React, { useState, useEffect } from 'react';
import { OrderSummary } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Package, 
  Wallet, 
  CreditCard, 
  RefreshCcw, 
  DollarSign,
  ShoppingBag,
  Calculator,
  Tag,
  CheckCircle,
  XCircle,
  HelpCircle
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

interface OrderSummaryProps {
  summary: OrderSummary;
  onSummaryChange: (field: keyof OrderSummary, value: number) => void;
}

const OrderSummaryComponent: React.FC<OrderSummaryProps> = ({ summary, onSummaryChange }) => {
  const [isPaidAlready, setIsPaidAlready] = useState(false);
  const [isCalculatingChange, setIsCalculatingChange] = useState(false);
  const [hasTip, setHasTip] = useState(false);
  
  // Handle input change with number validation
  const handleInputChange = (field: keyof OrderSummary, e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters except decimal point
    const sanitizedValue = e.target.value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const formattedValue = parts.length > 1 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitizedValue;
      
    const value = parseFloat(formattedValue) || 0;
    onSummaryChange(field, value);
  };

  // Calculate and update return amount when customer paid changes
  useEffect(() => {
    if (summary.customerPaid > 0) {
      const returnAmount = parseFloat((summary.customerPaid - summary.finalTotal).toFixed(2));
      onSummaryChange('returnToCustomer', returnAmount > 0 ? returnAmount : 0);
    } else {
      onSummaryChange('returnToCustomer', 0);
    }
  }, [summary.customerPaid, summary.finalTotal, onSummaryChange]);

  // Toggle already paid status
  const handlePaidAlreadyToggle = () => {
    setIsPaidAlready(!isPaidAlready);
    
    // If marked as paid, set customer paid equal to grand total
    if (!isPaidAlready) {
      onSummaryChange('customerPaid', summary.finalTotal);
      onSummaryChange('returnToCustomer', 0);
    } else {
      onSummaryChange('customerPaid', 0);
    }
  };

  // Quick tip options (percentages)
  const tipOptions = [5, 10, 15, 20];
  
  // Handle tip percentage selection
  const handleTipPercentage = (percentage: number) => {
    const tipAmount = parseFloat((summary.subTotal * (percentage / 100)).toFixed(2));
    onSummaryChange('tip', tipAmount);
    setHasTip(true);
  };
  
  // Dynamically calculate the final total including all charges and adjustments
  const finalTotal = summary.grandTotal + summary.deliveryCharge + summary.containerCharge - 0.01;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-primary" />
          Order Summary
        </h2>
      </div>
      
      {/* Item Summary Section */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center col-span-2 pb-2">
          <div className="flex items-center text-gray-700">
            <ShoppingBag className="w-4 h-4 mr-2 text-primary" />
            <span className="font-medium">Items Summary</span>
          </div>
          
          <span className="bg-primary text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {summary.totalQuantity} Items
          </span>
        </div>
        
        <div className="text-right text-gray-600">Sub Total</div>
        <div className="text-right font-medium">£{summary.subTotal.toFixed(2)}</div>
        
        <div className="text-right text-red-500 flex items-center justify-end gap-1">
          <Tag className="w-4 h-4" />
          <span>Discount</span>
        </div>
        <div className="text-right font-medium text-red-500">-£{summary.discount.toFixed(2)}</div>
        
        <div className="text-right text-gray-600">Total</div>
        <div className="text-right font-medium">£{summary.grandTotal.toFixed(2)}</div>
      </div>
      
      {/* Charges Section */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200">
        <div className="flex items-center col-span-2 mb-2">
          <Wallet className="w-4 h-4 mr-2 text-primary" />
          <span className="font-medium text-gray-700">Additional Charges</span>
        </div>
        
        <div className="text-right flex items-center justify-end gap-1 text-gray-600">
          <Truck className="w-4 h-4 text-gray-500" />
          <span>Delivery Charge</span>
          <Tooltip content="Fee for delivering order to customer's location">
            <HelpCircle className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
          </Tooltip>
        </div>
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">£</span>
            <input
              type="text"
              value={summary.deliveryCharge === 0 ? '' : summary.deliveryCharge}
              onChange={(e) => handleInputChange('deliveryCharge', e)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-3 text-right focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="text-right flex items-center justify-end gap-1 text-gray-600">
          <Package className="w-4 h-4 text-gray-500" />
          <span>Container Charge</span>
          <Tooltip content="Fee for packaging materials">
            <HelpCircle className="w-3.5 h-3.5 ml-0.5 text-gray-400" />
          </Tooltip>
        </div>
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">£</span>
            <input
              type="text"
              value={summary.containerCharge === 0 ? '' : summary.containerCharge}
              onChange={(e) => handleInputChange('containerCharge', e)}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-3 text-right focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="text-right text-gray-600 flex items-center justify-end gap-1">
          <RefreshCcw className="w-4 h-4" />
          <span>Round Off</span>
        </div>
        <div className="text-right font-medium text-red-500">-£0.01</div>
        
        <motion.div 
          className="text-right font-medium text-gray-800 col-span-2 mt-2 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
          animate={{ backgroundColor: ["#f9fafb", "#eef2ff", "#f9fafb"] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>Grand Total</span>
          <span className="text-xl font-bold text-primary">£{finalTotal.toFixed(2)}</span>
        </motion.div>
      </div>
      
      {/* Payment Section */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b border-gray-200">
        <div className="flex items-center col-span-2 mb-2">
          <CreditCard className="w-4 h-4 mr-2 text-primary" />
          <span className="font-medium text-gray-700">Payment Details</span>
        </div>
        
        <div className="col-span-2 mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="already-paid"
              checked={isPaidAlready}
              onChange={handlePaidAlreadyToggle}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="already-paid" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Customer already paid for this order
            </label>
            
            <AnimatePresence>
              {isPaidAlready && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="text-right flex items-center justify-end gap-1 text-gray-600">
          <Wallet className="w-4 h-4" />
          <span>Customer Paid</span>
        </div>
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">£</span>
            <input
              type="text"
              value={summary.customerPaid === 0 ? '' : summary.customerPaid}
              onChange={(e) => {
                handleInputChange('customerPaid', e);
                setIsCalculatingChange(true);
                setTimeout(() => setIsCalculatingChange(false), 500);
              }}
              placeholder="0.00"
              disabled={isPaidAlready}
              className={`w-full border rounded-md py-2 pl-8 pr-3 text-right transition-all duration-200 ${
                isPaidAlready
                  ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                  : 'border-gray-200 focus:ring-primary focus:border-primary'
              }`}
            />
          </div>
        </div>
        
        <div className="text-right flex items-center justify-end gap-1 text-gray-600">
          <RefreshCcw className="w-4 h-4" />
          <span>Return to Customer</span>
        </div>
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">£</span>
            <input
              type="text"
              value={summary.returnToCustomer === 0 ? '' : summary.returnToCustomer}
              placeholder="0.00"
              readOnly
              className={`w-full border border-gray-200 bg-gray-50 rounded-md py-2 pl-8 pr-3 text-right ${
                isCalculatingChange ? 'animate-pulse' : ''
              }`}
            />
            
            <AnimatePresence>
              {summary.returnToCustomer > 0 && !isCalculatingChange && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-y-0 right-3 flex items-center text-green-600"
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="text-right flex items-center justify-end gap-1 text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>Tip</span>
        </div>
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">£</span>
            <input
              type="text"
              value={summary.tip === 0 ? '' : summary.tip}
              onChange={(e) => {
                handleInputChange('tip', e);
                setHasTip(parseFloat(e.target.value) > 0);
              }}
              placeholder="0.00"
              className="w-full border border-gray-200 rounded-md py-2 pl-8 pr-3 text-right focus:ring-primary focus:border-primary transition-all duration-200"
            />
            
            <AnimatePresence>
              {hasTip && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-y-0 right-3 flex items-center text-yellow-500"
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Quick tip options */}
        <div className="col-span-2 mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Quick Tip:</span>
            {tipOptions.map((percentage) => (
              <button
                key={percentage}
                type="button"
                onClick={() => handleTipPercentage(percentage)}
                className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200"
              >
                {percentage}%
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onSummaryChange('tip', 0);
                setHasTip(false);
              }}
              className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Status Summary */}
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Payment Status:
          </div>
          {isPaidAlready ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Paid in Full
            </span>
          ) : summary.customerPaid >= finalTotal ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Fully Paid
            </span>
          ) : summary.customerPaid > 0 ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <XCircle className="w-3 h-3 mr-1" />
              Partially Paid
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle className="w-3 h-3 mr-1" />
              Not Paid
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummaryComponent;