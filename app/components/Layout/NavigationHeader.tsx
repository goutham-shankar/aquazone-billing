'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/Authcontext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiMenu, 
  FiPrinter, 
  FiHelpCircle 
} from 'react-icons/fi';
import { 
  Plus, 
  X, 
  Pause, 
  Play, 
  Clock,
  ShoppingCart,
  FileText
} from 'lucide-react';
import Link from 'next/link';
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

interface NavigationHeaderProps {
  toggleMenu?: () => void;
  toggleFullscreen?: () => void;
  isFullscreen?: boolean;
  // Tab-related props
  tabs: BillingTab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onCreateTab: () => void;
  onCloseTab: (tabId: string) => void;
  onPauseTab: (tabId: string) => void;
  onResumeTab: (tabId: string) => void;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  toggleMenu,
  toggleFullscreen,
  isFullscreen,
  tabs,
  activeTabId,
  onTabChange,
  onCreateTab,
  onCloseTab,
  onPauseTab,
  onResumeTab
}) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Navigation Bar */}
      <header className="px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center">
          {toggleMenu && (
            <button 
              onClick={toggleMenu} 
              className="p-2 mr-2 lg:hidden hover:bg-gray-100 rounded-md"
            >
              <FiMenu className="h-6 w-6 text-gray-600" />
            </button>
          )}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
            <span className="text-xs leading-tight">AZ</span>
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">AquaZone Billing</h1>
            <p className="text-xs text-gray-500">Multi-Tab POS System</p>
          </div>
        </div>

        <div className="flex space-x-2 items-center">
          {/* Header Icons */}
          <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <FiPrinter className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <FiSettings className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-md transition-colors">
            <FiHelpCircle className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg px-3 py-2 text-xs hidden lg:block">
            <div className="text-gray-600">Support</div>
            <div className="font-bold text-green-700">07969 223344</div>
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={userMenuRef}>
            {loading ? (
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
            ) : user ? (
              <>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 border rounded-full p-1 hover:bg-gray-50 transition-colors"
                >
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/user-placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center rounded-full">
                      <FiUser className="h-4 w-4" />
                    </div>
                  )}
                  <span className="text-sm font-medium pr-2 hidden md:block">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FiUser className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <FiSettings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <Link 
                href="/login"
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Integrated Billing Tabs */}
      <div className="px-4 py-2">
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
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={`relative flex items-center min-w-0 max-w-48 group ${
                    draggedTab === tab.id ? 'z-50' : ''
                  }`}
                >
                  <motion.button
                    onClick={() => onTabChange(tab.id)}
                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 min-w-0 ${
                      isActive
                        ? status === 'paused'
                          ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-800 shadow-md'
                          : status === 'active'
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 text-blue-800 shadow-md'
                          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800 shadow-md'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                    }`}
                    whileHover={{ y: -1, scale: 1.02 }}
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
                        className={`p-1 rounded-full text-xs shadow-md ${
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
                        className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs shadow-md"
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
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-200 ml-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Add new billing tab"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-medium">New Tab</span>
          </motion.button>
        </div>

        {/* Tab summary bar */}
        <div className="flex items-center justify-between mt-3 px-3 py-2 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg text-xs border border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">
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
          
          <div className="text-gray-700 font-semibold">
            Total: ₹{tabs.reduce((sum, tab) => sum + tab.summary.grandTotal, 0).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
