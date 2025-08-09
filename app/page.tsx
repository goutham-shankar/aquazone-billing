'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/Authcontext';
import NavigationHeader, { BillingTab } from './components/Layout/NavigationHeader';

import OrderTypeSelector from './components/Orderform/Ordertypeselector';
import CustomerInfoForm from './components/Orderform/Customerinfo';
import BillTable from './components/BillTable/BillTable';
import OrderSummaryComponent from './components/Summary/OrderSummary';
import PaymentMethods from './components/Payment/PaymentMeth';
import ActionButtons from './components/ActionButtons/ActionButton';
import { OrderType, CustomerInfo, BillItem, PaymentMethod, OrderSummary, Product } from './types';
import { useProducts } from './hooks/useProducts';
import { toast } from 'react-hot-toast';

export default function Home() {
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Use our custom hook for products
  const { 
    products, 
    isLoading: isLoadingProducts, 
    error: productError, 
    fetchProducts 
  } = useProducts();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    address: '',
    email: ''
  });
  
  // Initialize with empty bill items
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  const [summary, setSummary] = useState<OrderSummary>({
    totalQuantity: 0,
    subTotal: 0,
    discount: 0,
    tax: 0,
    deliveryCharge: 0,
    containerCharge: 0,
    grandTotal: 0,
    customerPaid: 0,
    returnToCustomer: 0,
    tip: 0
  });
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  
  // Get formatted date and time
  const [currentDateTime, setCurrentDateTime] = useState('');
  
  // Active tab for product catalog
  const [activeProductTab, setActiveProductTab] = useState<'catalog' | 'order'>('catalog');
  
  // Multi-tab billing state
  const [billingTabs, setBillingTabs] = useState<BillingTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  // Helper function to generate unique tab ID
  const generateTabId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Helper function to create a new tab
  const createNewTab = (): BillingTab => {
    return {
      id: generateTabId(),
      label: 'New Bill',
      customerInfo: {
        name: '',
        address: '',
        email: ''
      },
      billItems: [],
      summary: {
        totalQuantity: 0,
        subTotal: 0,
        discount: 0,
        tax: 0,
        deliveryCharge: 0,
        containerCharge: 0,
        grandTotal: 0,
        customerPaid: 0,
        returnToCustomer: 0,
        tip: 0
      },
      orderType: 'delivery',
      paymentMethod: 'cash',
      isPaused: false,
      createdAt: new Date(),
      lastActivity: new Date()
    };
  };

  // Initialize with first tab
  useEffect(() => {
    if (billingTabs.length === 0) {
      const firstTab = createNewTab();
      setBillingTabs([firstTab]);
      setActiveTabId(firstTab.id);
      // Initialize local state with first tab data
      setCustomerInfo(firstTab.customerInfo);
      setBillItems(firstTab.billItems);
      setSummary(firstTab.summary);
      setOrderType(firstTab.orderType);
      setPaymentMethod(firstTab.paymentMethod);
    }
  }, []);


  // Update current tab data
  const updateActiveTab = (updates: Partial<BillingTab>) => {
    setBillingTabs(tabs => 
      tabs.map(tab => 
        tab.id === activeTabId 
          ? { ...tab, ...updates, lastActivity: new Date() }
          : tab
      )
    );
  };

  // Tab management functions
  const handleCreateTab = () => {
    const newTab = createNewTab();
    setBillingTabs(tabs => [...tabs, newTab]);
    setActiveTabId(newTab.id);
    // Clear local state for new tab
    setCustomerInfo(newTab.customerInfo);
    setBillItems(newTab.billItems);
    setSummary(newTab.summary);
    setOrderType(newTab.orderType);
    setPaymentMethod(newTab.paymentMethod);
    toast.success('New billing tab created');
  };

  const handleTabChange = (tabId: string) => {
    // Save current tab state before switching
    if (activeTabId && activeTabId !== tabId) {
      updateActiveTab({
        customerInfo,
        billItems,
        summary,
        orderType,
        paymentMethod
      });
    }
    
    setActiveTabId(tabId);
    const tab = billingTabs.find(t => t.id === tabId);
    if (tab) {
      // Update local state with tab data
      setCustomerInfo(tab.customerInfo);
      setBillItems(tab.billItems);
      setSummary(tab.summary);
      setOrderType(tab.orderType);
      setPaymentMethod(tab.paymentMethod);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (billingTabs.length <= 1) {
      toast.error('Cannot close the last tab');
      return;
    }
    
    const tabToClose = billingTabs.find(t => t.id === tabId);
    if (tabToClose && (tabToClose.billItems.length > 0 || tabToClose.customerInfo.name)) {
      if (!window.confirm('This tab has unsaved data. Are you sure you want to close it?')) {
        return;
      }
    }

    setBillingTabs(tabs => tabs.filter(tab => tab.id !== tabId));
    
    if (activeTabId === tabId) {
      const remainingTabs = billingTabs.filter(tab => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTabId(remainingTabs[0].id);
        handleTabChange(remainingTabs[0].id);
      }
    }
    
    toast.success('Tab closed');
  };

  const handlePauseTab = (tabId: string) => {
    setBillingTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isPaused: true, lastActivity: new Date() }
          : tab
      )
    );
    toast.success('Tab paused - you can work on other customers');
  };

  const handleResumeTab = (tabId: string) => {
    setBillingTabs(tabs => 
      tabs.map(tab => 
        tab.id === tabId 
          ? { ...tab, isPaused: false, lastActivity: new Date() }
          : tab
      )
    );
    toast.success('Tab resumed');
  };

  // Sync current state changes with active tab (debounced)
  useEffect(() => {
    if (activeTabId) {
      const timeoutId = setTimeout(() => {
        updateActiveTab({
          customerInfo,
          billItems,
          summary,
          orderType,
          paymentMethod
        });
      }, 500); // Debounce updates by 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [customerInfo, billItems, summary, orderType, paymentMethod, activeTabId]);
  
  // Function to load sample data for testing
  const loadSampleData = () => {
    const sampleCustomer: CustomerInfo = {
      name: 'John Doe',
      mobile: '+91 9876543210',
      email: 'john.doe@example.com',
      address: '123 Main Street, Sample City - 123456'
    };
    
    const sampleItems: BillItem[] = [
      {
        id: 1,
        name: 'Bottled Water 1L',
        price: 20,
        quantity: 5,
        amount: 100,
        specialNote: 'Chilled'
      },
      {
        id: 2, 
        name: 'Water Can 20L',
        price: 45,
        quantity: 2,
        amount: 90,
        specialNote: ''
      },
      {
        id: 3,
        name: 'Soda Bottle 500ml',
        price: 25,
        quantity: 3,
        amount: 75,
        specialNote: 'Cold drink'
      }
    ];
    
    setCustomerInfo(sampleCustomer);
    setBillItems(sampleItems);
    setOrderType('delivery');
    setPaymentMethod('cash');
    
    // Calculate summary
    const subTotal = sampleItems.reduce((sum, item) => sum + item.amount, 0);
    const discount = 15;
    const tax = 25;
    const deliveryCharge = 30;
    const containerCharge = 5;
    const grandTotal = subTotal - discount + tax + deliveryCharge + containerCharge;
    
    const newSummary: OrderSummary = {
      subTotal,
      discount,
      tax,
      deliveryCharge,
      containerCharge,
      grandTotal,
      totalQuantity: sampleItems.reduce((sum, item) => sum + item.quantity, 0),
      customerPaid: 350,
      returnToCustomer: 350 - grandTotal,
      tip: 0
    };
    
    setSummary(newSummary);
    toast.success('Sample bill data loaded!');
  };
  
  // Function to save the invoice
  const onSave = async () => {
    try {
      if (billItems.length === 0) {
        toast.error("Cannot save an empty order");
        return null;
      }
      
      setIsSaving(true);
      
      // Create the invoice object
      const invoice = {
        customerInfo,
        items: billItems,
        summary,
        orderType,
        paymentMethod,
        dateTime: new Date().toISOString(),
      };
      
      try {
        // Get the authentication token
        const idToken = await getIdToken();
        
        if (!idToken) {
          throw new Error('Authentication failed');
        }
        
        // Send to API
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(invoice)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response:', errorText);
          throw new Error('Failed to save to server');
        }
        
        const data = await response.json();
        toast.success("Invoice saved successfully!");
        return data.id;
        
      } catch (apiError) {
        console.warn('API save failed, using local storage fallback:', apiError);
        
        // Fallback: Save to localStorage for demo purposes
        const invoiceId = 'INV-' + Date.now();
        const localInvoices = JSON.parse(localStorage.getItem('localInvoices') || '[]');
        localInvoices.push({
          id: invoiceId,
          ...invoice,
          createdAt: new Date().toISOString()
        });
        localStorage.setItem('localInvoices', JSON.stringify(localInvoices));
        
        toast.success("Invoice saved locally (demo mode)!");
        return invoiceId;
      }
      
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Add a product from the catalog to the bill
  const addProductToBill = (product: Product) => {
    // Get the product ID, handling both id and _id formats
    const productId = product._id || product.id || '';
    
    const existingItem = billItems.find(item => 
      'productId' in item && item.productId === productId
    );
    
    if (existingItem) {
      // Increase quantity if product already exists in bill
      handleItemQuantityChange(existingItem.id, existingItem.quantity + 1);
      toast.success(`Added another ${product.name} to the order`);
    } else {
      // Add new product to bill
      const newId = billItems.length > 0 ? 
        Math.max(...billItems.map(item => item.id)) + 1 : 1;
      
      const newItem: BillItem = {
        id: newId,
        name: product.name,
        specialNote: '',
        quantity: 1,
        price: product.price,
        amount: product.price,
        productId: productId // Store reference to product id
      };
      
      setBillItems(prevItems => [...prevItems, newItem]);
      toast.success(`Added ${product.name} to the order`);
      setActiveProductTab('order'); // Switch to order tab after adding product
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate totals when bill items change
  useEffect(() => {
    const totalQty = billItems.reduce((sum, item) => sum + item.quantity, 0);
    const subTotal = billItems.reduce((sum, item) => sum + item.amount, 0);
    
    setSummary(prev => {
      // Calculate grand total including all charges
      const totalWithCharges = subTotal + 
        (prev.tax || 0) + 
        (prev.deliveryCharge || 0) + 
        (prev.containerCharge || 0) - 
        (prev.discount || 0);
        
      const roundedGrandTotal = Math.round(totalWithCharges * 100) / 100;
      
      return {
        ...prev,
        totalQuantity: totalQty,
        subTotal: subTotal,
        grandTotal: roundedGrandTotal,
        returnToCustomer: Math.max(0, prev.customerPaid - roundedGrandTotal)
      };
    });
  }, [billItems, summary.tax, summary.deliveryCharge, summary.containerCharge, summary.discount]);
  
  const handleSummaryChange = (field: keyof OrderSummary, value: number) => {
    setSummary(prev => {
      const newSummary = {
        ...prev,
        [field]: value
      };
      
      // Recalculate grand total when any charge-related field changes
      if (['tax', 'deliveryCharge', 'containerCharge', 'discount'].includes(field)) {
        const totalWithCharges = prev.subTotal + 
          (field === 'tax' ? value : (prev.tax || 0)) + 
          (field === 'deliveryCharge' ? value : (prev.deliveryCharge || 0)) + 
          (field === 'containerCharge' ? value : (prev.containerCharge || 0)) - 
          (field === 'discount' ? value : (prev.discount || 0));
        
        newSummary.grandTotal = Math.round(totalWithCharges * 100) / 100;
        
        // Also update return amount if customer has already paid
        if (prev.customerPaid > 0) {
          newSummary.returnToCustomer = Math.max(0, prev.customerPaid - newSummary.grandTotal);
        }
      }
      
      // Update return to customer when paid amount changes
      if (field === 'customerPaid') {
        newSummary.returnToCustomer = Math.max(0, value - newSummary.grandTotal);
      }
      
      return newSummary;
    });
  };

  const handleItemQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Optionally remove the item if quantity goes below 1
      removeItem(id);
      return;
    }
    
    setBillItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newAmount = parseFloat((item.price * newQuantity).toFixed(2));
          return { ...item, quantity: newQuantity, amount: newAmount };
        }
        return item;
      })
    );
  };
  
  const handleItemSpecialNoteChange = (id: number, newNote: string) => {
    setBillItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          return { ...item, specialNote: newNote };
        }
        return item;
      })
    );
  };
  
  const addNewItem = () => {
    const newId = billItems.length > 0 ? 
      Math.max(...billItems.map(item => item.id)) + 1 : 1;
    
    const newItem: BillItem = {
      id: newId,
      name: 'New Item',
      specialNote: '',
      quantity: 1,
      price: 0,
      amount: 0
    };
    
    setBillItems([...billItems, newItem]);
    toast.success("Added new blank item");
    setActiveProductTab('order');
  };
  
  const removeItem = (id: number) => {
    const itemToRemove = billItems.find(item => item.id === id);
    setBillItems(billItems.filter(item => item.id !== id));
    
    if (itemToRemove) {
      toast.success(`Removed ${itemToRemove.name} from order`);
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const clearOrder = () => {
    const clearedData = {
      customerInfo: {
        name: '',
        address: '',
        email: ''
      },
      billItems: [],
      summary: {
        totalQuantity: 0,
        subTotal: 0,
        discount: 0,
        tax: 0,
        deliveryCharge: 0,
        containerCharge: 0,
        grandTotal: 0,
        customerPaid: 0,
        returnToCustomer: 0,
        tip: 0
      }
    };

    // Update local state
    setBillItems(clearedData.billItems);
    setCustomerInfo(clearedData.customerInfo);
    setSummary(clearedData.summary);

    // Update the active tab
    updateActiveTab(clearedData);
    
    toast.success("Order cleared");
  };

  // Filter products by category
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Extract unique categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => {
    if (typeof p.category === 'object' && p.category && p.category.name) {
      return p.category.name;
    }
    return typeof p.category === 'string' ? p.category : 'uncategorized';
  })))];
  
  // Filtered products based on selected category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => {
        // Handle both string and object categories
        if (typeof p.category === 'object' && p.category) {
          return p.category.name === selectedCategory;
        } else if (typeof p.category === 'string') {
          return p.category === selectedCategory;
        }
        return selectedCategory === 'uncategorized';
      });

  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchedProducts = searchQuery.trim() === '' 
    ? filteredProducts 
    : filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated and not redirected yet, show nothing
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      
      <div className="flex-1 flex flex-col h-screen relative">
        <NavigationHeader 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          tabs={billingTabs}
          activeTabId={activeTabId}
          onTabChange={handleTabChange}
          onCreateTab={handleCreateTab}
          onCloseTab={handleCloseTab}
          onPauseTab={handlePauseTab}
          onResumeTab={handleResumeTab}
        />
        
        <div className="flex h-[calc(100vh-180px)] max-h-[calc(100vh-180px)] overflow-hidden">{/* Adjusted height for larger header */}
          {/* Left Section - Customer Info & Order Items */}
          <div className="w-2/5 flex flex-col p-2 h-full">
            {/* Top row with date/time and quick actions */}
            <div className="flex justify-between items-center mb-1 px-2">
              <div className="text-xs font-medium text-gray-600">
                {currentDateTime}
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => fetchProducts()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center"
                  disabled={isLoadingProducts}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoadingProducts ? 'Loading...' : 'Refresh'}
                </button>
                <button 
                  onClick={clearOrder}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear
                </button>
                <button 
                  onClick={loadSampleData}
                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sample
                </button>
              </div>
            </div>
            
            {/* Customer Info Section */}
            <div className="bg-white rounded-lg shadow-sm p-2 mb-1 flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <OrderTypeSelector 
                  selectedType={orderType} 
                  onTypeChange={setOrderType} 
                />
              </div>
              <CustomerInfoForm 
                customerInfo={customerInfo} 
                onCustomerInfoChange={setCustomerInfo} 
                compact={true} // Add a compact prop to your component
              />
            </div>
            
            {/* Bill Section */}
            <div className="flex flex-col bg-white rounded-lg shadow-sm p-2 flex-grow h-0 overflow-hidden">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-medium text-gray-800">Order Items</h3>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={addNewItem}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                  <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-md">
                    Items: {billItems.length}
                  </span>
                </div>
              </div>
              
              <div className="flex-grow overflow-auto">
                {billItems.length > 0 ? (
                  <BillTable 
                    items={billItems} 
                    onQuantityChange={handleItemQuantityChange}
                    onSpecialNoteChange={handleItemSpecialNoteChange}
                    onRemoveItem={removeItem}
                    compact={true} // Add compact prop to your component
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p className="text-sm">No items added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Middle Section - Product Catalog/Order Tabs */}
          <div className="w-2/5 p-2 h-full flex flex-col">
            <div className="bg-white rounded-lg shadow-sm flex flex-col h-full">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-2 text-sm font-medium ${activeProductTab === 'catalog' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}
                  onClick={() => setActiveProductTab('catalog')}
                >
                  Product Catalog
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium ${activeProductTab === 'order' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-600'}`}
                  onClick={() => setActiveProductTab('order')}
                >
                  Order Summary
                </button>
              </div>
              
              {/* Tab content */}
              {activeProductTab === 'catalog' && (
                <div className="flex-grow overflow-hidden flex flex-col p-2">
                  {/* Search and Category Filters */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-1 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-2 py-1 border text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={typeof category === 'string' ? category : 'all'} 
                                value={typeof category === 'string' ? category : 'all'}>
                          {category === 'all' ? 'All Categories' : 
                           (typeof category === 'string' ? 
                             category.charAt(0).toUpperCase() + category.slice(1) : 
                             'Unknown')}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {productError && (
                    <div className="bg-red-50 text-red-800 p-2 rounded-md mb-2 text-xs">
                      {productError}
                    </div>
                  )}
                  
                  {isLoadingProducts ? (
                    <div className="flex justify-center py-4 flex-grow">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-auto flex-grow">
                      {searchedProducts.length > 0 ? (
                        searchedProducts.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => addProductToBill(product)}
                            className="border rounded p-2 cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white flex flex-col"
                          >
                            {(product.imageUrl || product.image) && (
                              <div className="w-full h-16 mb-1 overflow-hidden rounded">
                                <img 
                                  src={product.imageUrl || product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <h3 className="font-medium text-gray-800 text-xs truncate">{product.name}</h3>
                            <p className="text-emerald-600 font-bold text-xs">₹{product.price.toFixed(2)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8 text-gray-500 text-sm">
                          {searchQuery ? 
                            'No products match your search criteria.' : 
                            'No products found.'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeProductTab === 'order' && (
                <div className="flex-grow p-2 overflow-auto">
                  <OrderSummaryComponent 
                    summary={summary} 
                    onSummaryChange={handleSummaryChange}
                    compact={true} // Add compact prop to your component 
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Right Section - Payment & Actions */}
          <div className="w-1/5 p-2 flex flex-col h-full">
            <div className="bg-white rounded-lg shadow-sm p-2 mb-1 flex-grow">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Payment Method</h3>
              <PaymentMethods 
                selectedMethod={paymentMethod} 
                onMethodChange={setPaymentMethod}
                compact={true} // Add compact prop to your component
              />
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Order Total</h3>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md mb-2">
                  <span className="text-sm font-medium">Items:</span>
                  <span className="text-sm">{summary.totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md mb-2">
                  <span className="text-sm font-medium">Subtotal:</span>
                  <span className="text-sm">₹{summary.subTotal.toFixed(2)}</span>
                </div>
                {summary.tax > 0 && (
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md mb-2">
                    <span className="text-sm font-medium">Tax:</span>
                    <span className="text-sm">₹{summary.tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-md">
                  <span className="text-sm font-bold">Total:</span>
                  <span className="text-sm font-bold text-emerald-600">₹{summary.grandTotal.toFixed(2)}</span>
                </div>
                
                <div className="mt-4">
                  <label className="text-xs text-gray-500">Customer Paid</label>
                  <input
                    type="number"
                    value={summary.customerPaid}
                    onChange={(e) => handleSummaryChange('customerPaid', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
                  />
                </div>
                
                {summary.returnToCustomer > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md text-center">
                    <span className="text-sm font-medium">Change: ₹{summary.returnToCustomer.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-md p-3 mt-1 flex-shrink-0 border border-gray-200">
              <ActionButtons 
                isSaving={isSaving}
                onSave={onSave}
                onPrint={async () => {
                  const invoiceId = await onSave();
                  if (invoiceId) {
                    toast.success("Invoice ready for printing");
                    window.open(`/invoice/${invoiceId}?print=true`, '_blank');
                  }
                }}
                onEmail={async () => {
                  const invoiceId = await onSave();
                  if (invoiceId && customerInfo.email) {
                    toast.success(`Invoice will be emailed to ${customerInfo.email}`);
                  } else if (!customerInfo.email) {
                    toast.error("Customer email is required for sending invoice");
                  }
                }}
                onReset={clearOrder}
                onExit={() => router.push('/dashboard')}
                onHold={() => {
                  if (activeTabId) {
                    handlePauseTab(activeTabId);
                    // Create a new tab for the next customer
                    handleCreateTab();
                  }
                }}
                compact={true}
                billData={{
                  customerInfo,
                  billItems,
                  summary,
                  orderType,
                  paymentMethod
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}