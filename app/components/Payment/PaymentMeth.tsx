import React, { useState } from 'react';
import { PaymentMethod, CardType, PaymentDetails } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  CreditCard,
  Clock,
  CircleEllipsis,
  SplitSquareVertical,
  CheckCircle2,
  ChevronDown,
  Lock,
  CreditCard as CardIcon,
  Calendar,
  User,
  Smartphone,
  Banknote,
  Info,
  AlertCircle,
  X,
  Check,
  DollarSign,
  Percent,
  ArrowRight,
  Landmark,
  Wallet
} from 'lucide-react';

// Helper function to format rupee amounts
const formatRupee = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(amount);
};

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onPaymentDetailsChange?: (details: PaymentDetails) => void;
  amount?: number;
  showSaveOption?: boolean;
  customerHasWallet?: boolean;
  customerWalletBalance?: number;
}

interface PaymentOption {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  detailsComponent?: React.ReactNode;
}

interface CardTypeOption {
  type: CardType;
  label: string;
  icon: React.ReactNode;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodChange,
  onPaymentDetailsChange,
  amount = 0,
  showSaveOption = true,
  customerHasWallet = true,
  customerWalletBalance = 5250.00 // Updated to rupees (50 pounds * 105)
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'details'>('options');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [partialAmount, setPartialAmount] = useState<string>(amount > 0 ? (amount / 2).toFixed(2) : '');
  const [showCashDetails, setShowCashDetails] = useState(false);
  const [cashReceived, setCashReceived] = useState<string>(amount > 0 ? amount.toFixed(2) : '');
  const [showOtherPaymentOptions, setShowOtherPaymentOptions] = useState(false);
  
  // Card payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [selectedCardType, setSelectedCardType] = useState<CardType>('credit');

  // Calculate change amount for cash payments
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = Math.max(0, cashReceivedNum - amount);

  // Other payment option selection
  const [selectedOtherMethod, setSelectedOtherMethod] = useState('upi');

  // Quick cash amount options
  const getQuickCashOptions = () => {
    if (amount <= 0) return [5, 10, 20, 50];
    
    const roundedUp = Math.ceil(amount / 10) * 10;
    return [
      amount,
      roundedUp,
      roundedUp + 10,
      roundedUp + 20
    ];
  };

  const quickCashOptions = getQuickCashOptions();

  // Card types
  const cardTypes: CardTypeOption[] = [
    { type: 'credit', label: 'Credit Card', icon: <CreditCard className="w-4 h-4" /> },
    { type: 'debit', label: 'Debit Card', icon: <Banknote className="w-4 h-4" /> }
  ];

  // Other payment methods
  const otherPaymentMethods = [
    { id: 'upi', name: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'netbanking', name: 'Net Banking', icon: <Landmark className="w-4 h-4" /> },
    { id: 'wallet', name: 'Digital Wallet', icon: <Wallet className="w-4 h-4" /> }
  ];

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatCardNumber(e.target.value);
    setCardNumber(value.substring(0, 19)); // 16 digits + 3 spaces
    
    // Update payment details if callback provided
    if (onPaymentDetailsChange) {
      onPaymentDetailsChange({
        method: 'card',
        cardType: selectedCardType,
        cardNumber: value.replace(/\s+/g, ''),
        expiryDate: cardExpiry,
        cvc: cardCVC,
        cardholderName
      });
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = formatExpiryDate(e.target.value);
    setCardExpiry(value.substring(0, 5)); // MM/YY format
    
    // Update payment details if callback provided
    if (onPaymentDetailsChange && selectedMethod === 'card') {
      onPaymentDetailsChange({
        method: 'card',
        cardType: selectedCardType,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expiryDate: value,
        cvc: cardCVC,
        cardholderName
      });
    }
  };

  const handlePartialAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setPartialAmount(value);
    
    // Update payment details if callback provided
    if (onPaymentDetailsChange && selectedMethod === 'part') {
      onPaymentDetailsChange({
        method: 'part',
        partialAmount: parseFloat(value) || 0,
        remainingAmount: amount - (parseFloat(value) || 0)
      });
    }
  };

  const handleCashReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCashReceived(value);
    
    // Update payment details if callback provided
    if (onPaymentDetailsChange && selectedMethod === 'cash') {
      onPaymentDetailsChange({
        method: 'cash',
        amountReceived: parseFloat(value) || 0,
        changeAmount: Math.max(0, (parseFloat(value) || 0) - amount)
      });
    }
  };

  const setQuickCash = (amount: number) => {
    setCashReceived(amount.toFixed(2));
    
    // Update payment details if callback provided
    if (onPaymentDetailsChange && selectedMethod === 'cash') {
      onPaymentDetailsChange({
        method: 'cash',
        amountReceived: amount,
        changeAmount: Math.max(0, amount - (parseFloat(cashReceived) || 0))
      });
    }
  };

  // Define details component for each payment method
  const CardDetails = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <Lock className="w-3.5 h-3.5 mr-1.5 text-primary" />
          Card Information
        </h4>
        
        <div className="flex space-x-2">
          {cardTypes.map((cardType) => (
            <button
              key={cardType.type}
              type="button"
              onClick={() => setSelectedCardType(cardType.type)}
              className={`flex items-center px-2 py-1 rounded text-xs font-medium transition-colors ${
                selectedCardType === cardType.type
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cardType.icon}
              <span className="ml-1">{cardType.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="relative">
          <label htmlFor="card-number" className="block text-xs font-medium text-gray-700 mb-1">
            Card Number
          </label>
          <div className="relative">
            <input
              id="card-number"
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
            />
            <CardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            
            {cardNumber && cardNumber.length >= 19 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Check className="w-4 h-4 text-green-500" />
              </motion.div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label htmlFor="card-expiry" className="block text-xs font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <div className="relative">
              <input
                id="card-expiry"
                type="text"
                value={cardExpiry}
                onChange={handleCardExpiryChange}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="card-cvc" className="block text-xs font-medium text-gray-700 mb-1">
              CVC
            </label>
            <div className="relative">
              <input
                id="card-cvc"
                type="text"
                value={cardCVC}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCardCVC(value.substring(0, 3));
                  
                  if (onPaymentDetailsChange) {
                    onPaymentDetailsChange({
                      method: 'card',
                      cardType: selectedCardType,
                      cardNumber: cardNumber.replace(/\s+/g, ''),
                      expiryDate: cardExpiry,
                      cvc: value,
                      cardholderName
                    });
                  }
                }}
                placeholder="123"
                maxLength={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-help group">
                <Info className="w-4 h-4 text-gray-400" />
                <div className="hidden group-hover:block absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                  The 3-digit security code on the back of your card
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <label htmlFor="cardholder-name" className="block text-xs font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <div className="relative">
            <input
              id="cardholder-name"
              type="text"
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                
                if (onPaymentDetailsChange) {
                  onPaymentDetailsChange({
                    method: 'card',
                    cardType: selectedCardType,
                    cardNumber: cardNumber.replace(/\s+/g, ''),
                    expiryDate: cardExpiry,
                    cvc: cardCVC,
                    cardholderName: e.target.value
                  });
                }
              }}
              placeholder="JOHN SMITH"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm uppercase"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        {showSaveOption && (
          <div className="mt-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={savePaymentMethod}
                onChange={() => setSavePaymentMethod(!savePaymentMethod)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <span className="ml-2 text-sm text-gray-600">Save card for future payments</span>
            </label>
          </div>
        )}
      </div>
    </motion.div>
  );

  const PartPaymentDetails = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <div className="mb-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center mb-1">
          <SplitSquareVertical className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
          Part Payment Details
        </h4>
        <p className="text-xs text-gray-500">
          Enter the amount to be paid now. The remainder will be marked as due.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="relative">
            <label htmlFor="partial-amount" className="block text-xs font-medium text-gray-700 mb-1">
              Amount To Pay Now
            </label>
            <div className="relative">
              <input
                id="partial-amount"
                type="text"
                value={partialAmount}
                onChange={handlePartialAmountChange}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Quick percentage selectors */}
            <div className="flex space-x-2 mt-2">
              {[25, 50, 75].map(percent => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => {
                    const newAmount = (amount * percent / 100).toFixed(2);
                    setPartialAmount(newAmount);
                    
                    if (onPaymentDetailsChange) {
                      onPaymentDetailsChange({
                        method: 'part',
                        partialAmount: parseFloat(newAmount),
                        remainingAmount: amount - parseFloat(newAmount)
                      });
                    }
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  {percent}%
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  setPartialAmount(amount.toFixed(2));
                  
                  if (onPaymentDetailsChange) {
                    onPaymentDetailsChange({
                      method: 'part',
                      partialAmount: amount,
                      remainingAmount: 0
                    });
                  }
                }}
                className="px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded"
              >
                Full
              </button>
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="payment-method" className="block text-xs font-medium text-gray-700 mb-1">
              Payment Method For This Part
            </label>
            <select
              id="payment-method"
              className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm appearance-none"
              defaultValue="cash"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online Transfer</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h5 className="text-xs font-medium text-gray-700 mb-3">Payment Summary</h5>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">₹{formatRupee(amount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Paying Now:</span>
              <span className="font-medium text-indigo-600">₹{formatRupee(parseFloat(partialAmount) || 0)}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-600">Remaining Due:</span>
              <span className="font-medium text-amber-600">
                ₹{formatRupee(amount - (parseFloat(partialAmount) || 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const CashPaymentDetails = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <h4 className="text-sm font-medium text-gray-700 flex items-center mb-3">
        <Coins className="w-3.5 h-3.5 mr-1.5 text-green-500" />
        Cash Payment
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="relative mb-4">
            <label htmlFor="cash-received" className="block text-xs font-medium text-gray-700 mb-1">
              Cash Received
            </label>
            <div className="relative">
              <input
                id="cash-received"
                type="text"
                value={cashReceived}
                onChange={handleCashReceivedChange}
                placeholder="0.00"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Quick Cash Amounts
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {quickCashOptions.map((amount, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setQuickCash(amount)}
                  className="px-3 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-md flex items-center justify-center"
                >
                  ₹{formatRupee(amount)}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3 h-min">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bill Amount:</span>
              <span className="font-medium">₹{formatRupee(amount)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Cash Received:</span>
              <span className="font-medium text-green-600">₹{formatRupee(parseFloat(cashReceived) || 0)}</span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-gray-100">
              <span className="text-gray-600">Change:</span>
              <span className={`font-medium ${changeAmount > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                ₹{formatRupee(changeAmount)}
              </span>
            </div>
            
            {parseFloat(cashReceived) < amount && (
              <div className="mt-2 bg-amber-50 text-amber-700 text-xs p-2 rounded-md flex items-start">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
                <span>Cash received is less than the bill amount.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const DuePaymentDetails = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <h4 className="text-sm font-medium text-gray-700 flex items-center mb-2">
        <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
        Due Payment Details
      </h4>
      <p className="text-xs text-gray-500 mb-3">
        This order will be marked as due for payment later.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="relative">
            <label htmlFor="due-date" className="block text-xs font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <div className="relative">
              <input
                id="due-date"
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
                min={new Date().toISOString().split('T')[0]}
                defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="payment-notes" className="block text-xs font-medium text-gray-700 mb-1">
              Payment Notes
            </label>
            <textarea
              id="payment-notes"
              placeholder="Add notes about this due payment..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
              rows={3}
            />
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Due Amount:</span>
              <span className="font-medium text-amber-600">₹{formatRupee(amount)}</span>
            </div>
            
            <div className="pt-2 border-t border-gray-100">
              <div className="bg-amber-50 p-2 rounded-md">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <p className="font-medium mb-1">Payment Due Reminder</p>
                    <p>This order will be marked as unpaid and added to the customer's due balance. You can collect payment later from the customer profile.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const OtherPaymentDetails = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <h4 className="text-sm font-medium text-gray-700 flex items-center mb-3">
        <CircleEllipsis className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
        Other Payment Methods
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {otherPaymentMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedOtherMethod(method.id)}
                  className={`px-3 py-2 text-sm rounded-md flex flex-col items-center justify-center transition-colors ${
                    selectedOtherMethod === method.id
                      ? 'bg-purple-100 border-purple-300 text-purple-800 border'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`p-1 rounded-full ${
                    selectedOtherMethod === method.id ? 'bg-purple-200' : 'bg-gray-100'
                  } mb-1`}>
                    {method.icon}
                  </div>
                  <span className="text-xs">{method.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {selectedOtherMethod === 'upi' && (
            <div className="space-y-3">
              <div className="relative">
                <label htmlFor="upi-id" className="block text-xs font-medium text-gray-700 mb-1">
                  UPI ID
                </label>
                <input
                  id="upi-id"
                  type="text"
                  placeholder="username@paytm or username@googlepay"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm"
                />
              </div>
              
              <div className="text-center">
                <div className="bg-gray-100 p-2 rounded-md inline-flex items-center justify-center mb-2">
                  <QRCodeSample />
                </div>
                <p className="text-xs text-gray-500">Scan to pay via UPI</p>
              </div>
            </div>
          )}
          
          {selectedOtherMethod === 'netbanking' && (
            <div className="space-y-3">
              <div className="relative">
                <label htmlFor="bank-select" className="block text-xs font-medium text-gray-700 mb-1">
                  Select Bank
                </label>
                <select
                  id="bank-select"
                  className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-md focus:ring-primary focus:border-primary text-sm appearance-none"
                >
                  <option value="">Select your bank</option>
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="canara">Canara Bank</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                type="button"
                className="w-full py-2 bg-primary text-white rounded-md flex items-center justify-center text-sm"
              >
                <Landmark className="w-4 h-4 mr-1.5" />
                Proceed to Bank
              </button>
            </div>
          )}
          
          {selectedOtherMethod === 'wallet' && (
            <div className="space-y-3">
              {customerHasWallet ? (
                <>
                  <div className="bg-white border border-green-100 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">Wallet Balance:</span>
                      <span className="text-sm font-bold text-green-600">₹{formatRupee(customerWalletBalance)}</span>
                    </div>
                    
                    {customerWalletBalance >= amount ? (
                      <p className="text-xs text-green-600">
                        <Check className="w-3.5 h-3.5 inline mr-1" />
                        Sufficient balance available for this transaction
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                        Insufficient balance. Add ₹{formatRupee(amount - customerWalletBalance)} more
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    className={`w-full py-2 rounded-md flex items-center justify-center text-sm ${
                      customerWalletBalance >= amount
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={customerWalletBalance < amount}
                  >
                    <Wallet className="w-4 h-4 mr-1.5" />
                    Pay from Wallet
                  </button>
                </>
              ) : (
                <div className="bg-gray-100 p-3 rounded-md text-center">
                  <Wallet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Customer doesn't have a wallet</p>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs bg-primary text-white rounded-md"
                  >
                    Setup Wallet
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <h5 className="text-xs font-medium text-gray-700 mb-3">Payment Instructions</h5>
          
          {selectedOtherMethod === 'upi' && (
            <div className="space-y-2 text-xs text-gray-600">
              <p>1. Open any UPI app on your phone</p>
              <p>2. Scan the QR code or enter UPI ID</p>
              <p>3. Enter amount: ₹{formatRupee(amount)}</p>
              <p>4. Complete the payment and click verify below</p>
              
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Enter transaction reference..."
                    className="flex-grow rounded-l-md border border-gray-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    className="bg-primary text-white rounded-r-md px-3 py-2 text-sm flex items-center"
                  >
                    Verify
                    <ArrowRight className="ml-1 w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {selectedOtherMethod === 'netbanking' && (
            <div className="space-y-2 text-xs text-gray-600">
              <p>1. You will be redirected to your bank's website</p>
              <p>2. Login to your account</p>
              <p>3. Authorize payment of ₹{formatRupee(amount)}</p>
              <p>4. You will be returned to complete the order</p>
              
              <div className="mt-2 bg-blue-50 p-2 rounded-md flex items-center">
                <Info className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                <span className="text-blue-700">Make sure pop-ups are enabled in your browser</span>
              </div>
            </div>
          )}
          
          {selectedOtherMethod === 'wallet' && (
            <div className="space-y-2 text-xs text-gray-600">
              <p className="font-medium text-gray-700">Wallet Benefits:</p>
              <div className="flex items-start space-x-1.5">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>Quick and easy payments</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>Earn loyalty points on every top-up</span>
              </div>
              <div className="flex items-start space-x-1.5">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span>Special discounts for wallet users</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Define each payment option with its details component
  const paymentOptions: PaymentOption[] = [
    {
      value: 'cash',
      label: 'Cash',
      icon: <Coins className="w-5 h-5" />,
      description: 'Pay with physical cash',
      color: 'bg-green-100 text-green-600 border-green-200',
      detailsComponent: CashPaymentDetails
    },
    {
      value: 'card',
      label: 'Card',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Credit or debit card',
      color: 'bg-blue-100 text-blue-600 border-blue-200',
      detailsComponent: CardDetails
    },
    {
      value: 'due',
      label: 'Due Payment',
      icon: <Clock className="w-5 h-5" />,
      description: 'Payment to be collected later',
      color: 'bg-amber-100 text-amber-600 border-amber-200',
      detailsComponent: DuePaymentDetails
    },
    {
      value: 'others',
      label: 'Others',
      icon: <CircleEllipsis className="w-5 h-5" />,
      description: 'UPI, Net Banking, etc.',
      color: 'bg-purple-100 text-purple-600 border-purple-200',
      detailsComponent: OtherPaymentDetails
    },
    {
      value: 'part',
      label: 'Part Payment',
      icon: <SplitSquareVertical className="w-5 h-5" />,
      description: 'Pay a portion now',
      color: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      detailsComponent: PartPaymentDetails
    }
  ];
  
  // Find selected payment option
  const selectedOption = paymentOptions.find(option => option.value === selectedMethod);

  return (
    <div className="my-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'options' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Payment Methods
          </button>
          
          {selectedMethod && (
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'details' 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Payment Details
            </button>
          )}
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div className="p-4">
        {activeTab === 'options' ? (
          <>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Select Payment Method</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {paymentOptions.map((option) => (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onMethodChange(option.value);
                    setActiveTab('details');
                  }}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    selectedMethod === option.value
                      ? `border-primary ring-2 ring-primary ring-opacity-20 ${option.color}`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    id={`payment-${option.value}`}
                    className="sr-only"
                    checked={selectedMethod === option.value}
                    onChange={() => {
                      onMethodChange(option.value);
                      setActiveTab('details');
                    }}
                  />
                  
                  <label 
                    htmlFor={`payment-${option.value}`}
                    className="block p-4 cursor-pointer"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`rounded-full p-2 ${
                        selectedMethod === option.value 
                          ? option.color.split(' ')[0] 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {option.icon}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className={`font-medium ${
                        selectedMethod === option.value ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {option.description}
                      </p>
                    </div>
                  </label>
                  
                  {selectedMethod === option.value && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -top-2 -right-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary bg-white rounded-full" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Action button */}
            {selectedMethod && (
              <div className="mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 bg-primary text-white rounded-md flex items-center text-sm font-medium"
                >
                  Continue to Details
                  <ArrowRight className="ml-1 w-4 h-4" />
                </motion.button>
              </div>
            )}
          </>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {selectedOption && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`rounded-full p-2 ${selectedOption.color}`}>
                        {selectedOption.icon}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-800">{selectedOption.label}</h3>
                        <p className="text-sm text-gray-500">{selectedOption.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('options')}
                      className="text-sm text-primary hover:text-primary-dark flex items-center"
                    >
                      Change
                      <ChevronDown className="ml-1 w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Render the appropriate details component */}
                  {selectedOption.detailsComponent}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      
      {/* Footer with action buttons */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          {activeTab === 'details' && (
            <button
              onClick={() => setActiveTab('options')}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <ChevronDown className="mr-1 w-4 h-4 rotate-90" />
              Back to Methods
            </button>
          )}
          
          {activeTab === 'options' && (
            <div className="text-sm text-gray-500">
              Select a payment method to proceed
            </div>
          )}
          
          <div>
            {amount > 0 && (
              <span className="text-sm text-gray-600 mr-3">
                Total Amount: <span className="font-medium text-gray-800">₹{formatRupee(amount)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple QR code visualization
const QRCodeSample = () => (
  <svg width="80" height="80" viewBox="0 0 100 100">
    <rect x="0" y="0" width="100" height="100" fill="white" />
    <g fill="black">
      <rect x="10" y="10" width="20" height="20" />
      <rect x="70" y="10" width="20" height="20" />
      <rect x="10" y="70" width="20" height="20" />
      <rect x="40" y="10" width="10" height="10" />
      <rect x="60" y="40" width="10" height="10" />
      <rect x="40" y="50" width="10" height="10" />
      <rect x="60" y="60" width="10" height="10" />
      <rect x="40" y="70" width="10" height="10" />
      <rect x="70" y="40" width="10" height="10" />
    </g>
  </svg>
);

export default PaymentMethods;