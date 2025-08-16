'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Type Definitions for Props ---
interface HeldBillInfo {
  id: string;
  items: number;
  customer: string;
  timestamp: Date;
}

interface BillActionsProps {
  onHold: () => void;
  onResume: (billId: string) => void;
  onClear: () => void;
  hasActiveItems: boolean;
  heldBills: HeldBillInfo[];
}

const BillActions: React.FC<BillActionsProps> = ({ 
  onHold, 
  onResume, 
  onClear, 
  hasActiveItems, 
  heldBills 
}) => {
  const [isResumeListOpen, setResumeListOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={onHold}
        disabled={!hasActiveItems}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        whileHover={{ scale: hasActiveItems ? 1.05 : 1 }}
        whileTap={{ scale: hasActiveItems ? 0.95 : 1 }}
      >
        Hold Bill
      </motion.button>

      <div className="relative">
        <motion.button
          onClick={() => setResumeListOpen(prev => !prev)}
          disabled={heldBills.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          whileHover={{ scale: heldBills.length > 0 ? 1.05 : 1 }}
          whileTap={{ scale: heldBills.length > 0 ? 0.95 : 1 }}
        >
          Resume ({heldBills.length})
        </motion.button>
        <AnimatePresence>
          {isResumeListOpen && heldBills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-20 border border-gray-200"
            >
              <div className="p-2 font-semibold text-sm text-gray-700 border-b">Held Bills</div>
              <ul className="py-1 max-h-60 overflow-y-auto">
                {heldBills.map(bill => (
                  <li key={bill.id}>
                    <button
                      onClick={() => {
                        onResume(bill.id);
                        setResumeListOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{bill.customer}</div>
                        <div className="text-xs text-gray-500">{bill.items} items</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {bill.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <motion.button
        onClick={onClear}
        disabled={!hasActiveItems}
        className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        whileHover={{ scale: hasActiveItems ? 1.05 : 1 }}
        whileTap={{ scale: hasActiveItems ? 0.95 : 1 }}
      >
        Clear Bill
      </motion.button>
    </div>
  );
};

export default BillActions;
