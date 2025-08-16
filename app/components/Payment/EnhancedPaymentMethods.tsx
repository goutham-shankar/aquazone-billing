'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PaymentMethod } from '../../types';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod | string;
  onMethodChange: (method: PaymentMethod | string) => void;
  amount: number;
  onAmountPaid: (amount: number) => void;
  compact?: boolean;
}

export default function EnhancedPaymentMethods({
  selectedMethod,
  onMethodChange,
  amount,
  onAmountPaid,
  compact = false
}: PaymentMethodsProps) {
  const [paidAmount, setPaidAmount] = useState<string>(amount.toString());
  const [showSplitOptions, setShowSplitOptions] = useState<boolean>(false);
  const [splitPayments, setSplitPayments] = useState<{method: string, amount: number}[]>([]);
  
  const methods = [
    {
      id: 'cash',
      label: 'Cash',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'card',
      label: 'Card',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'upi',
      label: 'UPI',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      id: 'gift_card',
      label: 'Gift Card',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    {
      id: 'split',
      label: 'Split',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimals
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPaidAmount(value);
    onAmountPaid(Number(value) || 0);
  };

  const handleSplitPayment = () => {
    if (splitPayments.length === 0) {
      // Initialize with one method if empty
      setSplitPayments([{ method: 'cash', amount: amount / 2 }]);
    }
    setShowSplitOptions(true);
    onMethodChange('split');
  };

  const addSplitPayment = () => {
    const totalPaid = splitPayments.reduce((sum, payment) => sum + payment.amount, 0);
    if (totalPaid < amount) {
      setSplitPayments([...splitPayments, { method: 'card', amount: amount - totalPaid }]);
    }
  };

  const updateSplitPayment = (index: number, field: 'method' | 'amount', value: string | number) => {
    const updatedPayments = [...splitPayments];
    if (field === 'method') {
      updatedPayments[index].method = value as string;
    } else {
      updatedPayments[index].amount = Number(value);
    }
    setSplitPayments(updatedPayments);
    
    // Update total paid amount
    const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    onAmountPaid(totalPaid);
  };

  const removeSplitPayment = (index: number) => {
    if (splitPayments.length > 1) {
      const updatedPayments = splitPayments.filter((_, i) => i !== index);
      setSplitPayments(updatedPayments);
      
      // Update total paid amount
      const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
      onAmountPaid(totalPaid);
    }
  };

  if (compact) {
    // Compact view for small screens
    return (
      <div className="flex flex-col space-y-2">
        <select
          value={selectedMethod as string}
          onChange={(e) => onMethodChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          {methods.map((method) => (
            <option key={method.id} value={method.id}>
              {method.label}
            </option>
          ))}
        </select>
        
        {selectedMethod === 'split' ? (
          <div className="space-y-2 mt-2">
            {splitPayments.map((payment, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={payment.method}
                  onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                  className="flex-1 p-1 border border-gray-300 rounded"
                >
                  {methods.filter(m => m.id !== 'split').map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={payment.amount}
                  onChange={(e) => updateSplitPayment(index, 'amount', e.target.value.replace(/[^0-9.]/g, ''))}
                  className="flex-1 p-1 border border-gray-300 rounded"
                />
                <button 
                  onClick={() => removeSplitPayment(index)}
                  className="p-1 text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button 
              onClick={addSplitPayment}
              className="w-full p-1 text-sm bg-blue-100 text-blue-600 rounded"
            >
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <input
              type="text"
              value={paidAmount}
              onChange={handlePaymentAmountChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter amount paid"
            />
          </div>
        )}
      </div>
    );
  }

  // Full view for regular screens
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {methods.map((method) => (
          <motion.button
            key={method.id}
            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${
              selectedMethod === method.id 
                ? 'bg-blue-100 border-2 border-blue-500 text-blue-700' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => method.id === 'split' ? handleSplitPayment() : onMethodChange(method.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`p-2 rounded-full ${selectedMethod === method.id ? 'bg-blue-200' : 'bg-gray-100'}`}>
              {method.icon}
            </div>
            <span className="mt-2 font-medium">{method.label}</span>
          </motion.button>
        ))}
      </div>
      
      {selectedMethod === 'split' && showSplitOptions ? (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-3">Split Payment</h4>
          <div className="space-y-3">
            {splitPayments.map((payment, index) => (
              <div key={index} className="flex items-center space-x-3">
                <select
                  value={payment.method}
                  onChange={(e) => updateSplitPayment(index, 'method', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                >
                  {methods.filter(m => m.id !== 'split').map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={payment.amount}
                  onChange={(e) => updateSplitPayment(index, 'amount', e.target.value.replace(/[^0-9.]/g, ''))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                  placeholder="Amount"
                />
                <button 
                  onClick={() => removeSplitPayment(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <motion.button
              onClick={addSplitPayment}
              className="w-full p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={splitPayments.reduce((sum, payment) => sum + payment.amount, 0) >= amount}
            >
              Add Another Payment Method
            </motion.button>
          </div>
        </div>
      ) : selectedMethod && selectedMethod !== 'split' ? (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="font-medium text-gray-700 mb-2 block">Amount Paid</label>
          <input
            type="text"
            value={paidAmount}
            onChange={handlePaymentAmountChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter amount paid"
          />
          
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[500, 1000, 5000, 10000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => {
                  setPaidAmount(quickAmount.toString());
                  onAmountPaid(quickAmount);
                }}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                {quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
