import React from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Printer, 
  Mail, 
  RotateCcw, 
  LogOut, 
  Clock 
} from 'lucide-react';
import { printBill, generateSampleBill, PrintBillData } from '../../utils/printBill';
import { BillItem, CustomerInfo, OrderSummary, OrderType, PaymentMethod } from '../../types';

interface ActionButtonsProps {
  onSave: () => Promise<void>;
  onPrint?: () => Promise<void>;
  onEmail: () => Promise<void>;
  onReset: () => void;
  onExit: () => void;
  onHold: () => void;
  isSaving: boolean;
  compact?: boolean;
  // Bill data for printing
  billData?: {
    customerInfo: CustomerInfo;
    billItems: BillItem[];
    summary: OrderSummary;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
  };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSave,
  onPrint,
  onEmail,
  onReset,
  onExit,
  onHold,
  isSaving,
  compact = false,
  billData
}) => {
  const handleSaveAndPrint = async () => {
    try {
      // First save the bill
      await onSave();
      
      // Then print it
      if (billData) {
        const printData: PrintBillData = {
          ...billData,
          dateTime: new Date().toISOString()
        };
        await printBill(printData);
      } else {
        // Use sample data if no bill data provided
        await printBill(generateSampleBill());
      }
    } catch (error) {
      console.error('Error saving and printing bill:', error);
      alert('Error printing bill. Please try again.');
    }
  };

  const handlePrintOnly = async () => {
    try {
      if (onPrint) {
        await onPrint();
      } else {
        // Direct print without saving
        if (billData) {
          const printData: PrintBillData = {
            ...billData,
            dateTime: new Date().toISOString()
          };
          await printBill(printData);
        } else {
          // Use sample data if no bill data provided
          await printBill(generateSampleBill());
        }
      }
    } catch (error) {
      console.error('Error printing bill:', error);
      alert('Error printing bill. Please try again.');
    }
  };
  // Compact mode for bottom-right area
  if (compact) {
    return (
      <div className="w-full">
        {/* Primary Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <motion.button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            onClick={onSave}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </motion.button>
          
          <motion.button 
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-3 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            onClick={handlePrintOnly}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Printer className="w-4 h-4 mr-1" />
            Print
          </motion.button>
          
          <motion.button 
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            onClick={onEmail}
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="w-4 h-4 mr-1" />
            Email
          </motion.button>
        </div>
        
        {/* Secondary Action Buttons Row */}
        <div className="grid grid-cols-3 gap-2">
          <motion.button 
            className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-3 py-2 rounded-lg font-medium shadow-md text-sm flex items-center justify-center"
            onClick={onReset}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </motion.button>
          
          <motion.button 
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3 py-2 rounded-lg font-medium shadow-md text-sm flex items-center justify-center"
            onClick={onHold}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Clock className="w-4 h-4 mr-1" />
            Hold
          </motion.button>
          
          <motion.button 
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg font-medium shadow-md text-sm flex items-center justify-center"
            onClick={onExit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4 mr-1" />
            Exit
          </motion.button>
        </div>
      </div>
    );
  }
  
  // Full mode for larger layouts
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
      <div className="flex flex-wrap gap-2">
        <motion.button 
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onSave}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </motion.button>
        
        <motion.button 
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleSaveAndPrint}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Printer className="w-4 h-4 mr-2" />
          Save & Print
        </motion.button>
        
        <motion.button 
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={onEmail}
          disabled={isSaving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Mail className="w-4 h-4 mr-2" />
          Save & Email
        </motion.button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <motion.button 
          className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-2 rounded-lg font-medium shadow-md flex items-center"
          onClick={onReset}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </motion.button>
        
        <motion.button 
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium shadow-md flex items-center"
          onClick={onHold}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Clock className="w-4 h-4 mr-2" />
          Hold
        </motion.button>
        
        <motion.button 
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-md flex items-center"
          onClick={onExit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Exit
        </motion.button>
      </div>
    </div>
  );
};

export default ActionButtons;