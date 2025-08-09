import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  X, 
  Pause, 
  Play, 
  Clock,
  ShoppingCart,
  FileText
} from 'lucide-react';
import { CustomerInfo, BillItem, OrderSummary, OrderType, PaymentMethod } from '../../types';

export interface BillingTab {
  id: string;
  label: string;
  customerInfo: CustomerInfo;
  billItems: BillItem[];
  summary: OrderSummary;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  isPaused: boolean;
  createdAt: Date;
  lastActivity: Date;
}

interface BillingTabsProps {
  tabs: BillingTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onCreateTab: () => void;
  onCloseTab: (tabId: string) => void;
  onPauseTab: (tabId: string) => void;
  onResumeTab: (tabId: string) => void;
}

const BillingTabs: React.FC<BillingTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onCreateTab,
  onCloseTab,
  onPauseTab,
  onResumeTab
}) => {
  const getTabDisplayName = (tab: BillingTab) => {
    if (tab.customerInfo.name) {
      return tab.customerInfo.name;
    }
    if (tab.customerInfo.mobile) {
      return tab.customerInfo.mobile;
    }
    return `Bill #${tab.id.slice(-4)}`;
  };

  const getTabIcon = (tab: BillingTab) => {
    if (tab.isPaused) {
      return <Pause className="w-3 h-3" />;
    }
    if (tab.billItems.length > 0) {
      return <ShoppingCart className="w-3 h-3" />;
    }
    return <FileText className="w-3 h-3" />;
  };

  const getTabStatus = (tab: BillingTab) => {
    if (tab.isPaused) return 'paused';
    if (tab.billItems.length > 0) return 'active';
    return 'new';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
        <AnimatePresence>
          {tabs.map((tab, index) => {
            const isActive = tab.id === activeTabId;
            const status = getTabStatus(tab);
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`relative flex items-center min-w-0 max-w-48 group`}
              >
                <motion.button
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center space-x-2 px-3 py-2 rounded-t-lg border-b-2 transition-all duration-200 min-w-0 ${
                    isActive
                      ? status === 'paused'
                        ? 'bg-amber-50 border-amber-400 text-amber-800'
                        : status === 'active'
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-green-50 border-green-400 text-green-800'
                      : 'bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Status indicator */}
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    status === 'paused'
                      ? 'bg-amber-100 text-amber-600'
                      : status === 'active'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {getTabIcon(tab)}
                  </div>
                  
                  {/* Tab label */}
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium text-sm truncate max-w-24">
                      {getTabDisplayName(tab)}
                    </span>
                    <div className="flex items-center space-x-1 text-xs opacity-75">
                      {tab.billItems.length > 0 && (
                        <span>{tab.billItems.length} items</span>
                      )}
                      {tab.summary.grandTotal > 0 && (
                        <span>₹{tab.summary.grandTotal.toFixed(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Activity indicator for paused tabs */}
                  {tab.isPaused && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Clock className="w-2 h-2 text-white m-0.5" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Tab actions */}
                <div className="absolute -top-1 -right-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Pause/Resume button */}
                  {isActive && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tab.isPaused) {
                          onResumeTab(tab.id);
                        } else {
                          onPauseTab(tab.id);
                        }
                      }}
                      className={`p-1 rounded-full text-xs ${
                        tab.isPaused
                          ? 'bg-green-500 hover:bg-green-600 text-white'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={tab.isPaused ? 'Resume' : 'Pause'}
                    >
                      {tab.isPaused ? (
                        <Play className="w-3 h-3" />
                      ) : (
                        <Pause className="w-3 h-3" />
                      )}
                    </motion.button>
                  )}

                  {/* Close button */}
                  {tabs.length > 1 && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Close tab"
                    >
                      <X className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add new tab button */}
        <motion.button
          onClick={onCreateTab}
          className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-200 ml-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Add new billing tab"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-medium">New Tab</span>
        </motion.button>
      </div>

      {/* Tab summary bar */}
      <div className="flex items-center justify-between mt-2 px-2 py-1 bg-gray-50 rounded-lg text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">
            {tabs.length} tab{tabs.length !== 1 ? 's' : ''} open
          </span>
          {tabs.filter(t => t.isPaused).length > 0 && (
            <span className="text-amber-600 flex items-center">
              <Pause className="w-3 h-3 mr-1" />
              {tabs.filter(t => t.isPaused).length} paused
            </span>
          )}
          {tabs.filter(t => t.billItems.length > 0).length > 0 && (
            <span className="text-blue-600 flex items-center">
              <ShoppingCart className="w-3 h-3 mr-1" />
              {tabs.filter(t => t.billItems.length > 0).length} with items
            </span>
          )}
        </div>
        
        <div className="text-gray-500">
          Total: ₹{tabs.reduce((sum, tab) => sum + tab.summary.grandTotal, 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

export default BillingTabs;
