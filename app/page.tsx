"use client"
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Plus, Search, Calendar, User, Calculator, Printer, Send, Save, X, Edit3, LogOut, ShoppingCart, Package, Users, Settings, Building, Sun, Moon, Menu, Bell, FileText } from 'lucide-react';

// Firebase auth functions (replace with actual Firebase imports)
import { auth } from './lib/firebase'; // Add your Firebase config path
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

// Dark Mode Context
const DarkModeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {}
});

const useDarkMode = () => useContext(DarkModeContext);

// Type definitions
type Product = {
  id: number | string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  sku: string;
  barcode: string;
  pluCode: string;
  taxRate: number;
  taxIncluded: boolean;
  wholesalePrice?: number;
  retailPrice?: number;
  subCategory?: string;
};

type InvoiceItem = {
  id: number;
  itemCode: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  taxable: boolean;
  lineTotal: number;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  taxId: string;
};

type User = {
  uid: string;
  email: string;
  displayName: string;
};

// Removed getCurrentUser (unused)

const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

const getAuthToken = async (): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const fetchProducts = async (searchTerm: string = ''): Promise<Product[]> => {
  try {
    const authToken = await getAuthToken();
    if (!authToken) {
      throw new Error('Authentication required. Please sign in.');
    }

    const url = new URL('https://x2zlcvi4af.execute-api.ap-south-1.amazonaws.com/dev/product');
    if (searchTerm.trim()) {
      url.searchParams.append('search', searchTerm);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      if (response.status === 403) {
        throw new Error('Access denied. You do not have permission to view products.');
      }
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const productsArray = Array.isArray(data) ? data : data.products || data.data || [];
    
    return productsArray.map((item: Product | Record<string, unknown>) => ({
      id: (item as any)._id ?? (item as any).id ?? '',
      name: (item as any).name ?? (item as any).productName ?? '',
      description: (item as any).description ?? '',
      price: parseFloat((item as any).price ?? (item as any).unitPrice ?? '0'),
      category: typeof (item as any).category === 'object' && (item as any).category?.name
        ? (item as any).category.name
        : (item as any).category ?? 'Uncategorized',
      stock: parseInt((item as any).stock ?? (item as any).quantity ?? '0'),
      image: (item as any).image ?? (item as any).imageUrl ?? '',
      sku: (item as any).sku ?? (item as any).productCode ?? '',
      barcode: (item as any).barcode ?? '',
      pluCode: (item as any).pluCode ?? (item as any).plu ?? '',
      taxRate: parseFloat((item as any).taxRate ?? '0.18'),
      taxIncluded: (item as any).taxIncluded ?? false,
      wholesalePrice: parseFloat((item as any).wholesalePrice ?? '0'),
      retailPrice: parseFloat((item as any).retailPrice ?? '0'),
      subCategory: (item as any).subCategory ?? '',
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Dark Mode Provider Component
const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(saved ? JSON.parse(saved) : prefersDark);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Enhanced Navbar Component
const EnhancedNavbar = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section - Brand & Navigation */}
          <div className="flex items-center space-x-6">
            {/* Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Golden Aquazone</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Billing System</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <FileText className="h-4 w-4 mr-2" />
                Billing
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Package className="h-4 w-4 mr-2" />
                Products
              </button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Users className="h-4 w-4 mr-2" />
                Customers
              </button>
            </div>
          </div>

          {/* Right Section - Actions & User */}
          <div className="flex items-center space-x-3">
            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm">
                <Save className="h-4 w-4 mr-1" />
                Save
              </button>
              <button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                <Printer className="h-4 w-4 mr-1" />
                Print
              </button>
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user.displayName || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white">{user.displayName || 'User'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const ModernBillingUI = () => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    invoiceNumber: `INV${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: 'Net 30',
    salesRep: 'Sales Representative',
    customer: {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      taxId: ''
    } as Customer,
    items: [] as InvoiceItem[],
    discount: 0,
    delivery: 0,
  });

  // Initialize user and fetch products on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email || 'User'
        };
        setUser(user);
        
        try {
          await loadProducts();
        } catch (error) {
          console.error('Failed to load products:', error);
        }
      } else {
        setUser(null);
        setProducts([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProducts = async (search: string = '') => {
    if (!auth.currentUser) {
      console.warn('No authenticated user found');
      return;
    }

    setIsLoading(true);
    try {
      const fetchedProducts = await fetchProducts(search);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      if (error instanceof Error) {
        if (error.message.includes('Authentication')) {
          setUser(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      await loadProducts(term);
    } else {
      await loadProducts();
    }
  }, []);

  const addProductToInvoice = (product: Product) => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      itemCode: product.sku,
      name: product.name,
      description: product.description,
      quantity: 1,
      price: product.price,
      taxable: !product.taxIncluded,
      lineTotal: product.price,
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setIsProductModalOpen(false);
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: string | number | boolean) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedItem.lineTotal = updatedItem.quantity * updatedItem.price;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const removeItem = (id: number) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateCustomer = (field: keyof Customer, value: string) => {
    setInvoice(prev => ({
      ...prev,
      customer: { ...prev.customer, [field]: value }
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountAmount = subtotal * (invoice.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const tax = invoice.items.reduce((sum, item) => 
      item.taxable ? sum + (item.lineTotal * 0.18) : sum, 0
    );
    const total = taxableAmount + tax + invoice.delivery;
    
    return { subtotal, discount: discountAmount, tax, total };
  };

  const totals = calculateTotals();

  const addNewItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now(),
      itemCode: '',
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      taxable: true,
      lineTotal: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Currency formatter for Indian Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center max-w-md border dark:border-gray-700">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access New Golden Aquazone Billing System.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <DarkModeProvider>
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200">
        {/* Enhanced Navbar */}
        <EnhancedNavbar user={user} onSignOut={handleSignOut} />

        {/* Main Content */}
        <div className="flex-1 flex gap-3 p-3 overflow-hidden">
          {/* Left Panel - 70% */}
          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
            {/* Company & Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 h-40 border dark:border-gray-700">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Bill From */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <Building className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                    Bill From
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">New Golden Aquazone</div>
                    <div>Premium Aquarium Solutions</div>
                    <div>Mumbai, Maharashtra, India</div>
                    <div>+91 98765 43210 | info@newgoldenaquazone.com</div>
                  </div>
                </div>

                {/* Bill To */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-1 text-green-600 dark:text-green-400" />
                    Bill To
                    <button 
                      onClick={() => setIsCustomerFormOpen(true)}
                      className="ml-auto flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded text-xs transition-colors"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  </h3>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {invoice.customer.name || 'No customer selected'}
                    </div>
                    <div>{invoice.customer.email}</div>
                    <div>{invoice.customer.phone}</div>
                    <div>{invoice.customer.address && `${invoice.customer.address}, ${invoice.customer.city} ${invoice.customer.state} ${invoice.customer.zipCode}`}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 h-24 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                Invoice Details
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice #</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Terms</label>
                  <select
                    value={invoice.terms}
                    onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 flex flex-col overflow-hidden border dark:border-gray-700">
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                  Items ({invoice.items.length})
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                  >
                    <Package className="h-3 w-3 mr-1" />
                    Add Product
                  </button>
                  <button
                    onClick={addNewItem}
                    className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Custom Item
                  </button>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
                <div className="col-span-2">Code</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-center">Tax</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto">
                {invoice.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <Package className="h-8 w-8 mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">No items added yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded items-center text-xs">
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={item.itemCode}
                            onChange={(e) => updateItem(item.id, 'itemCode', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Code"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded mb-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Item name"
                          />
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            placeholder="Description"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            min="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <input
                            type="checkbox"
                            checked={item.taxable}
                            onChange={(e) => updateItem(item.id, 'taxable', e.target.checked)}
                            className="h-3 w-3 text-blue-600"
                          />
                        </div>
                        <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(item.lineTotal)}
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - 30% */}
          <div className="w-80 flex flex-col gap-3 overflow-hidden">
            {/* Invoice Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Calculator className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
                Summary
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totals.subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Discount</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={invoice.discount}
                      onChange={(e) => setInvoice(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                      className="w-12 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded mr-1 text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">%</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                  <input
                    type="number"
                    value={invoice.delivery}
                    onChange={(e) => setInvoice(prev => ({ ...prev, delivery: parseFloat(e.target.value) || 0 }))}
                    className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">GST (18%)</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totals.tax)}</span>
                </div>
                
                <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(totals.total)}</span>
                </div>
              </div>
              
              <button className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                Mark as PAID
              </button>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 border dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                  <Printer className="h-4 w-4 mr-1" />
                  Print Invoice
                </button>
                <button className="w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                  <Send className="h-4 w-4 mr-1" />
                  Send Email
                </button>
                <button className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
                  <Save className="h-4 w-4 mr-1" />
                  Save as PDF
                </button>
              </div>

              </div></div>
        </div>

        {/* Customer Form Modal */}
        {isCustomerFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Information</h3>
                <button
                  onClick={() => setIsCustomerFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      value={invoice.customer.name}
                      onChange={(e) => updateCustomer('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={invoice.customer.email}
                      onChange={(e) => updateCustomer('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={invoice.customer.phone}
                      onChange={(e) => updateCustomer('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Number</label>
                    <input
                      type="text"
                      value={invoice.customer.taxId}
                      onChange={(e) => updateCustomer('taxId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="GST registration number"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={invoice.customer.address}
                      onChange={(e) => updateCustomer('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input
                      type="text"
                      value={invoice.customer.city}
                      onChange={(e) => updateCustomer('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                    <input
                      type="text"
                      value={invoice.customer.state}
                      onChange={(e) => updateCustomer('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={invoice.customer.zipCode}
                      onChange={(e) => updateCustomer('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="400001"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
                <button
                  onClick={() => setIsCustomerFormOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsCustomerFormOpen(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Save Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Selection Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[80vh] flex flex-col border dark:border-gray-700">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Select Products</h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, or category..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading products...</span>
                  </div>
                ) : products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700"
                        onClick={() => addProductToInvoice(product)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>SKU: {product.sku}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                product.stock > 10 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                  : product.stock > 0 
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' 
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              }`}>
                                {product.stock}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</span>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3 flex-shrink-0">
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => loadProducts()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DarkModeProvider>
  );
};

export default ModernBillingUI;