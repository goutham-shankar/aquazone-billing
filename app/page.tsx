'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/Authcontext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
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
  
  // Initialize with empty bill items instead of sample data
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
  
  // Function to save the invoice
  const onSave = async () => {
    try {
      if (billItems.length === 0) {
        toast.error("Cannot save an empty order");
        return null;
      }
      
      setIsSaving(true);
      
      // Get the authentication token
      const idToken = await getIdToken();
      
      if (!idToken) {
        throw new Error('Authentication failed');
      }
      
      // Create the invoice object
      const invoice = {
        customerInfo,
        items: billItems,
        summary,
        orderType,
        paymentMethod,
        dateTime: new Date().toISOString(),
      };
      
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save invoice');
      }
      
      const data = await response.json();
      toast.success("Invoice saved successfully!");
      
      // Optional: Clear the form after successful save
      // clearOrder();
      
      return data.id;
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save invoice');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // We're now using the useProducts hook instead of this function

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
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // We don't need this effect anymore as useProducts handles fetching products

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
    setBillItems([]);
    setCustomerInfo({
      name: '',
      address: '',
      email: ''
    });
    setSummary({
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 fixed lg:relative z-50 transition-transform duration-300 ease-in-out
      `}>
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col relative">
        <Header 
          toggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
        
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Top bar with time and quick actions */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm font-medium text-gray-600">
              {currentDateTime}
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => fetchProducts()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center shadow-sm"
                disabled={isLoadingProducts}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoadingProducts ? 'Loading...' : 'Refresh Products'}
              </button>
              <button 
                onClick={addNewItem}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
              <button 
                onClick={clearOrder}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <OrderTypeSelector 
              selectedType={orderType} 
              onTypeChange={setOrderType} 
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Customer Information</h2>
            <CustomerInfoForm 
              customerInfo={customerInfo} 
              onCustomerInfoChange={setCustomerInfo} 
            />
          </div>
          
          {/* Product Catalog */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Product Catalog</h2>
              <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-md">
                Products: {searchedProducts.length} of {products.length}
              </span>
            </div>
            
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 sm:flex-initial">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>
            
            {productError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                {productError}
              </div>
            )}
            
            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {searchedProducts.length > 0 ? (
                  searchedProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addProductToBill(product)}
                      className="border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow duration-200 bg-white flex flex-col"
                    >
                      {(product.imageUrl || product.image) && (
                        <div className="w-full h-24 mb-2 overflow-hidden rounded-md">
                          <img 
                            src={product.imageUrl || product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="font-medium text-gray-800 text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-emerald-600 font-bold text-sm">${product.price.toFixed(2)}</p>
                      <span className="text-xs text-gray-500 mt-1">
                        {typeof product.category === 'object' ? 
                          product.category.name : 
                          (product.category || 'uncategorized')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {searchQuery ? 
                      'No products match your search criteria.' : 
                      'No products found. Click the "Refresh Products" button to try again.'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800 border-b pb-2">Order Items</h2>
              <span className="text-sm font-medium bg-blue-100 text-blue-800 py-1 px-2 rounded-md">
                Items: {billItems.length}
              </span>
            </div>
            {billItems.length > 0 ? (
              <BillTable 
                items={billItems} 
                onQuantityChange={handleItemQuantityChange}
                onSpecialNoteChange={handleItemSpecialNoteChange}
                onRemoveItem={removeItem}
              />
            ) : (
              <div className="text-center py-10 text-gray-500">
                <p>No items added to the order yet.</p>
                <p className="mt-2">Add products from the catalog above or use the "Add Item" button.</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Payment Details</h2>
              <PaymentMethods 
                selectedMethod={paymentMethod} 
                onMethodChange={setPaymentMethod} 
              />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">Order Summary</h2>
              <OrderSummaryComponent 
                summary={summary} 
                onSummaryChange={handleSummaryChange} 
              />
            </div>
          </div>
          
          <div className="mt-6">
            <ActionButtons 
              isSaving={isSaving}
              onSave={onSave}
              onPrint={async () => {
                const invoiceId = await onSave();
                if (invoiceId) {
                  // Logic for printing - could open in new window
                  toast.success("Invoice ready for printing");
                  window.open(`/invoice/${invoiceId}?print=true`, '_blank');
                }
              }}
              onEmail={async () => {
                const invoiceId = await onSave();
                if (invoiceId && customerInfo.email) {
                  toast.success(`Invoice will be emailed to ${customerInfo.email}`);
                  // Implement email sending logic
                } else if (!customerInfo.email) {
                  toast.error("Customer email is required for sending invoice");
                }
              }}
              onReset={clearOrder}
              onExit={() => router.push('/dashboard')}
              onHold={() => {
                toast.success("Order placed on hold");
                // Implement hold logic
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}