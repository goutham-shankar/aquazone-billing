"use client"
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Plus, Search, Calendar, User, Calculator, Printer, Send, Save, X, Edit3, LogOut, ShoppingCart, Package, Users, Settings, Sun, Moon, Menu, Bell, FileText, Monitor } from 'lucide-react';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Firebase auth functions (replace with actual Firebase imports)
import { auth } from './lib/firebase'; // Add your Firebase config path
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';


// --- PDF Document Component ---
const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  invoiceTitle: {
    fontSize: 16,
    color: 'grey',
  },
  billTo: {
    marginBottom: 20,
  },
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    alignItems: 'center',
    minHeight: 24,
  },
  tableHeader: {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
  },
  colDescription: { width: '45%', padding: 5 },
  colQty: { width: '15%', padding: 5, textAlign: 'center' },
  colPrice: { width: '20%', padding: 5, textAlign: 'right' },
  colTotal: { width: '20%', padding: 5, textAlign: 'right' },
  summary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  summaryContainer: {
    width: '45%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    marginTop: 5,
    paddingTop: 5,
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: 'grey',
    fontSize: 10,
  },
});

const InvoicePDF = ({ invoice, totals, formatCurrency }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <View>
          <Text style={pdfStyles.companyName}>New Golden Aquazone</Text>
          {/* --- MODIFIED --- Dynamically set the title */}
          <Text style={pdfStyles.invoiceTitle}>{invoice.billType === 'Invoice' ? 'TAX INVOICE' : 'QUOTATION'}</Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          {/* --- MODIFIED --- Dynamically set the label */}
          <Text>{invoice.billType === 'Invoice' ? 'Invoice' : 'Quotation'} #: {invoice.invoiceNumber}</Text>
          <Text>Date: {new Date(invoice.date).toLocaleDateString('en-IN')}</Text>
          <Text>Due Date: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</Text>
        </View>
      </View>

      <View style={pdfStyles.billTo}>
        <Text style={{ fontWeight: 'bold' }}>Bill To:</Text>
        <Text>{invoice.customer.name}</Text>
        <Text>{invoice.customer.address}, {invoice.customer.city}</Text>
        <Text>{invoice.customer.state} - {invoice.customer.zipCode}</Text>
        <Text>{invoice.customer.phone}</Text>
        {invoice.customer.taxId && <Text>GSTIN: {invoice.customer.taxId}</Text>}
      </View>

      <View style={pdfStyles.table}>
        <View style={[pdfStyles.tableRow, pdfStyles.tableHeader]}>
          <Text style={pdfStyles.colDescription}>Item Description</Text>
          <Text style={pdfStyles.colQty}>Qty</Text>
          <Text style={pdfStyles.colPrice}>Price</Text>
          <Text style={pdfStyles.colTotal}>Total</Text>
        </View>
        {invoice.items.map(item => (
          <View style={pdfStyles.tableRow} key={item.id}>
            <Text style={pdfStyles.colDescription}>{item.name}</Text>
            <Text style={pdfStyles.colQty}>{item.quantity}</Text>
            <Text style={pdfStyles.colPrice}>{formatCurrency(item.price)}</Text>
            <Text style={pdfStyles.colTotal}>{formatCurrency(item.lineTotal)}</Text>
          </View>
        ))}
      </View>

      <View style={pdfStyles.summary}>
        <View style={pdfStyles.summaryContainer}>
          <View style={pdfStyles.summaryRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(totals.subtotal)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text>Discount ({invoice.discount}%)</Text>
            <Text>- {formatCurrency(totals.discount)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text>Delivery</Text>
            <Text>{formatCurrency(invoice.delivery)}</Text>
          </View>
          <View style={pdfStyles.summaryRow}>
            <Text>GST (18%)</Text>
            <Text>{formatCurrency(totals.tax)}</Text>
          </View>
          <View style={[pdfStyles.summaryRow, pdfStyles.summaryTotal]}>
            <Text>TOTAL</Text>
            <Text>{formatCurrency(totals.total)}</Text>
          </View>
        </View>
      </View>

      <Text style={pdfStyles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
);


// --- CONTEXT AND TYPES ---

const DarkModeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => { }
});
const useDarkMode = () => useContext(DarkModeContext);

const TerminalContext = createContext({
  terminals: [] as Terminal[],
  activeTerminalId: '',
  addTerminal: () => { },
  removeTerminal: (id: string) => { },
  setActiveTerminal: (id: string) => { },
  updateTerminalInvoice: (id: string, invoice: any) => { }
});
const useTerminals = () => useContext(TerminalContext);

type Product = { id: number | string; name: string; description: string; price: number; category: string; stock: number; image: string; sku: string; barcode: string; pluCode: string; taxRate: number; taxIncluded: boolean; wholesalePrice?: number; retailPrice?: number; subCategory?: string; };
type InvoiceItem = { id: number; itemCode: string; name: string; description: string; quantity: number; price: number; taxable: boolean; lineTotal: number; };
type Customer = { name: string; email: string; phone: string; address: string; city: string; state: string; zipCode: string; taxId: string; };
type User = { uid: string; email: string; displayName: string; };
// --- MODIFIED --- Added billType to the invoice object in the Terminal type
type Terminal = { id: string; name: string; invoice: { billType: 'Invoice' | 'Quotation'; invoiceNumber: string; date: string; dueDate: string; terms: string; salesRep: string; customer: Customer; items: InvoiceItem[]; discount: number; delivery: number; }; createdAt: Date; lastActivity: Date; };

// --- AUTH AND DATA FETCHING ---

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
    const response = await fetch(url.toString(), { method: 'GET', headers });

    if (!response.ok) {
      if (response.status === 401) throw new Error('Authentication failed. Please sign in again.');
      if (response.status === 403) throw new Error('Access denied. You do not have permission to view products.');
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const productsArray = Array.isArray(data) ? data : data.products || data.data || [];

    return productsArray.map((item: any) => ({
      id: item._id || item.id,
      name: item.name || item.productName || '',
      description: item.description || '',
      price: parseFloat(item.price || item.unitPrice || 0),
      category: typeof item.category === 'object' && item.category?.name ? item.category.name : item.category || 'Uncategorized',
      stock: parseInt(item.stock || item.quantity || 0),
      image: item.image || item.imageUrl || '',
      sku: item.sku || item.productCode || '',
      barcode: item.barcode || '',
      pluCode: item.pluCode || item.plu || '',
      taxRate: parseFloat(item.taxRate || 0.18),
      taxIncluded: item.taxIncluded || false,
      wholesalePrice: parseFloat(item.wholesalePrice || 0),
      retailPrice: parseFloat(item.retailPrice || 0),
      subCategory: item.subCategory || '',
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// --- PROVIDER COMPONENTS ---

const DarkModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  return <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>{children}</DarkModeContext.Provider>;
};

const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState('');

  const createNewInvoice = () => ({
    // --- ADDED --- Set default bill type
    billType: 'Invoice' as 'Invoice' | 'Quotation',
    invoiceNumber: `INV${new Date().getFullYear()}${String(Date.now()).slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: 'Net 30',
    salesRep: 'Sales Representative',
    customer: { name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '', taxId: '' } as Customer,
    items: [] as InvoiceItem[],
    discount: 0,
    delivery: 0,
  });

  const addTerminal = () => {
    const terminalNumber = terminals.length + 1;
    const now = new Date();
    const newTerminal: Terminal = {
      id: `terminal_${Date.now()}`,
      name: `Terminal ${terminalNumber}`,
      invoice: createNewInvoice(),
      createdAt: now,
      lastActivity: now
    };
    setTerminals(prev => [...prev, newTerminal]);
    setActiveTerminalId(newTerminal.id);
  };

  const removeTerminal = (id: string) => {
    if (terminals.length === 1) return;
    setTerminals(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeTerminalId === id && filtered.length > 0) {
        setActiveTerminalId(filtered[0].id);
      }
      return filtered;
    });
  };

  const setActiveTerminal = (id: string) => {
    setActiveTerminalId(id);
    setTerminals(prev => prev.map(t => t.id === id ? { ...t, lastActivity: new Date() } : t));
  };

  const updateTerminalInvoice = (id: string, invoice: any) => {
    setTerminals(prev => prev.map(t => t.id === id ? { ...t, invoice, lastActivity: new Date() } : t));
  };

  useEffect(() => {
    if (terminals.length === 0) {
      const now = new Date();
      const initialTerminal: Terminal = {
        id: 'terminal_initial',
        name: 'Terminal 1',
        invoice: createNewInvoice(),
        createdAt: now,
        lastActivity: now
      };
      setTerminals([initialTerminal]);
      setActiveTerminalId(initialTerminal.id);
    }
  }, [terminals.length]);

  return (
    <TerminalContext.Provider value={{ terminals, activeTerminalId, addTerminal, removeTerminal, setActiveTerminal, updateTerminalInvoice }}>
      {children}
    </TerminalContext.Provider>
  );
};


// --- UI COMPONENTS ---

const TerminalTabs = () => {
  const { terminals, activeTerminalId, addTerminal, removeTerminal, setActiveTerminal } = useTerminals();
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {terminals.map((terminal) => (
          <div
            key={terminal.id}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors min-w-0 ${activeTerminalId === terminal.id
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            onClick={() => setActiveTerminal(terminal.id)}
          >
            <Monitor className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium truncate">{terminal.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 bg-gray-200 dark:bg-gray-600 px-1 rounded">
              {terminal.invoice.items.length}
            </span>
            {terminals.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTerminal(terminal.id); }}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTerminal}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New Terminal</span>
        </button>
      </div>
    </div>
  );
};

const EnhancedNavbar = ({ user, onSignOut }: { user: User; onSignOut: () => void }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">New Golden Aquazone</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Billing System</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-1">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><FileText className="h-4 w-4 mr-2" />Billing</button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Package className="h-4 w-4 mr-2" />Products</button>
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Users className="h-4 w-4 mr-2" />Customers</button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm"><Save className="h-4 w-4 mr-1" />Save</button>
              <button className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"><Printer className="h-4 w-4 mr-1" />Print</button>
            </div>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Bell className="h-5 w-5" /></button>
            <button onClick={toggleDarkMode} className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user.displayName || 'User'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                </div>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-gray-900 dark:text-white">{user.displayName || 'User'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"><User className="h-4 w-4 mr-2" />Profile</button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"><Settings className="h-4 w-4 mr-2" />Settings</button>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button onClick={() => { setIsMenuOpen(false); onSignOut(); }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"><LogOut className="h-4 w-4 mr-2" />Sign Out</button>
                  </div>
                </div>
              )}
            </div>
            <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"><Menu className="h-5 w-5" /></button>
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
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { terminals, activeTerminalId, updateTerminalInvoice } = useTerminals();
  const activeTerminal = terminals.find(t => t.id === activeTerminalId);
  const invoice = activeTerminal?.invoice;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser = { uid: firebaseUser.uid, email: firebaseUser.email || '', displayName: firebaseUser.displayName || firebaseUser.email || 'User' };
        setUser(currentUser);
        try {
          await loadProducts();
        } catch (error) {
          console.error('Failed to load products on mount:', error);
        }
      } else {
        setUser(null);
        setProducts([]);
        window.location.href = '/login';
      }
    });
    return () => unsubscribe();
  }, []);

  const loadProducts = async (search: string = '') => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const fetchedProducts = await fetchProducts(search);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      if (error instanceof Error && error.message.includes('Authentication')) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => { loadProducts(term); }, 400);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const addProductToInvoice = (product: Product) => {
    if (!activeTerminal || !invoice) return;
    const newItem: InvoiceItem = { id: Date.now(), itemCode: product.sku, name: product.name, description: product.description, quantity: 1, price: product.price, taxable: !product.taxIncluded, lineTotal: product.price };
    const updatedInvoice = { ...invoice, items: [...invoice.items, newItem] };
    updateTerminalInvoice(activeTerminal.id, updatedInvoice);
    setIsProductModalOpen(false);
  };

  const updateInvoice = (updates: any) => {
    if (!activeTerminal || !invoice) return;
    const updatedInvoice = { ...invoice, ...updates };
    updateTerminalInvoice(activeTerminal.id, updatedInvoice);
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    if (!activeTerminal || !invoice) return;
    const updatedItems = invoice.items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updatedItem.lineTotal = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    });
    updateInvoice({ items: updatedItems });
  };

  const removeItem = (id: number) => {
    if (!activeTerminal || !invoice) return;
    updateInvoice({ items: invoice.items.filter(item => item.id !== id) });
  };

  const updateCustomer = (field: keyof Customer, value: string) => {
    if (!activeTerminal || !invoice) return;
    updateInvoice({ customer: { ...invoice.customer, [field]: value } });
  };

  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, discount: 0, tax: 0, total: 0 };
    const subtotal = invoice.items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discountAmount = subtotal * (invoice.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const tax = invoice.items.reduce((sum, item) => item.taxable ? sum + (item.lineTotal * 0.18) : sum, 0);
    const total = taxableAmount + tax + invoice.delivery;
    return { subtotal, discount: discountAmount, tax, total };
  };

  const totals = calculateTotals();

  const addNewItem = () => {
    if (!activeTerminal || !invoice) return;
    const newItem: InvoiceItem = { id: Date.now(), itemCode: '', name: '', description: '', quantity: 1, price: 0, taxable: true, lineTotal: 0 };
    updateInvoice({ items: [...invoice.items, newItem] });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount);
  };

  if (!user) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl text-center max-w-md border dark:border-gray-700">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4"><Calculator className="h-8 w-8 text-white" /></div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to access the billing system.</p>
          <button onClick={() => window.location.href = '/login'} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg">Go to Login</button>
        </div>
      </div>
    );
  }

  if (!activeTerminal || !invoice) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col transition-colors duration-200">
      <EnhancedNavbar user={user} onSignOut={handleSignOut} />
      <TerminalTabs />

      {/* Main Content */}
      <main className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 border dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center"><User className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />Bill To</h3>
              <button onClick={() => setIsCustomerFormOpen(true)} className="flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline"><Edit3 className="h-3 w-3 mr-1" />{invoice.customer.name ? 'Edit' : 'Add Customer'}</button>
            </div>
            {invoice.customer.name ? (
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{invoice.customer.name}</p>
                {invoice.customer.email && <p>{invoice.customer.email}</p>}
                {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
                {invoice.customer.address && <p>{invoice.customer.address}, {invoice.customer.city} {invoice.customer.state} {invoice.customer.zipCode}</p>}
                {invoice.customer.taxId && <p className="font-mono text-xs pt-1">GSTIN: {invoice.customer.taxId}</p>}
              </div>
            ) : (
              <div onClick={() => setIsCustomerFormOpen(true)} className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="text-center text-gray-500 dark:text-gray-400"><Plus className="h-5 w-5 mx-auto mb-1" /><p className="text-sm font-medium">Add Customer</p></div>
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 border dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center"><Calendar className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />Invoice Details</h3>
            {/* --- MODIFIED --- Changed grid layout to accommodate the new field */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* --- NEW SECTION --- Dropdown for selecting bill type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select value={invoice.billType} onChange={(e) => updateInvoice({ billType: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option value="Invoice">Invoice</option>
                  <option value="Quotation">Quotation</option>
                </select>
              </div>
              {/* --- END NEW SECTION --- */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{invoice.billType} #</label>
                <input type="text" value={invoice.invoiceNumber} onChange={(e) => updateInvoice({ invoiceNumber: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={invoice.date} onChange={(e) => updateInvoice({ date: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input type="date" value={invoice.dueDate} onChange={(e) => updateInvoice({ dueDate: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Terms</label>
                <select value={invoice.terms} onChange={(e) => updateInvoice({ terms: e.target.value })} className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                  <option>Net 30</option><option>Net 15</option><option>Due on Receipt</option><option>Net 60</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 flex flex-col overflow-hidden border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center"><ShoppingCart className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />Items ({invoice.items.length})</h3>
              <div className="flex space-x-2">
                <button onClick={() => setIsProductModalOpen(true)} className="flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"><Package className="h-3 w-3 mr-1" />Add Product</button>
                <button onClick={addNewItem} className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"><Plus className="h-3 w-3 mr-1" />Custom Item</button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
              <div className="col-span-2">Code</div><div className="col-span-3">Description</div><div className="col-span-1 text-center">Qty</div><div className="col-span-2 text-right">Price</div><div className="col-span-1 text-center">Tax</div><div className="col-span-2 text-right">Total</div><div className="col-span-1"></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {invoice.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"><Package className="h-8 w-8 mb-2 text-gray-300 dark:text-gray-600" /><p className="text-sm">No items added yet</p></div>
              ) : (
                <div className="space-y-1">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded items-center text-xs">
                      <div className="col-span-2"><input type="text" value={item.itemCode} onChange={(e) => updateItem(item.id, 'itemCode', e.target.value)} className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Code" /></div>
                      <div className="col-span-3"><input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded mb-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Item name" /><input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" placeholder="Description" /></div>
                      <div className="col-span-1"><input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" min="0" /></div>
                      <div className="col-span-2"><input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" min="0" step="0.01" /></div>
                      <div className="col-span-1 text-center"><input type="checkbox" checked={item.taxable} onChange={(e) => updateItem(item.id, 'taxable', e.target.checked)} className="h-3 w-3 text-blue-600" /></div>
                      <div className="col-span-2 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(item.lineTotal)}</div>
                      <div className="col-span-1 text-center"><button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors"><X className="h-3 w-3" /></button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <aside className="w-80 flex flex-col gap-3 overflow-hidden">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 border dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center"><Calculator className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totals.subtotal)}</span></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Discount</span><div className="flex items-center"><input type="number" value={invoice.discount} onChange={(e) => updateInvoice({ discount: parseFloat(e.target.value) || 0 })} className="w-12 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded mr-1 text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" min="0" max="100" step="0.1" /><span className="text-xs text-gray-600 dark:text-gray-400">%</span></div></div>
              <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Delivery</span><input type="number" value={invoice.delivery} onChange={(e) => updateInvoice({ delivery: parseFloat(e.target.value) || 0 })} className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="0.00" step="0.01" min="0" /></div>
              <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">GST (18%)</span><span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totals.tax)}</span></div>
              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600"><span className="font-bold text-gray-900 dark:text-gray-100">Total</span><span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(totals.total)}</span></div>
            </div>
            <button className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">Mark as PAID</button>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 border dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"><Printer className="h-4 w-4 mr-1" />Print Invoice</button>
              <button className="w-full flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"><Send className="h-4 w-4 mr-1" />Send Email</button>

              <PDFDownloadLink
                document={<InvoicePDF invoice={invoice} totals={totals} formatCurrency={formatCurrency} />}
                fileName={`invoice-${invoice.invoiceNumber}.pdf`}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                {({ loading }) => (loading ? 'Generating...' : <><Save className="h-4 w-4 mr-1" />Save as PDF</>)}
              </PDFDownloadLink>

            </div>
          </section>
        </aside>
      </main>

      {/* Modals */}
      {isCustomerFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Customer Information</h3>
              <button onClick={() => setIsCustomerFormOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label><input type="text" value={invoice.customer.name} onChange={(e) => updateCustomer('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Enter customer name" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label><input type="email" value={invoice.customer.email} onChange={(e) => updateCustomer('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="customer@example.com" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label><input type="tel" value={invoice.customer.phone} onChange={(e) => updateCustomer('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="+91 98765 43210" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST Number</label><input type="text" value={invoice.customer.taxId} onChange={(e) => updateCustomer('taxId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="GST registration number" /></div>
                <div className="col-span-1 md:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street Address</label><input type="text" value={invoice.customer.address} onChange={(e) => updateCustomer('address', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Enter street address" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label><input type="text" value={invoice.customer.city} onChange={(e) => updateCustomer('city', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="City" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label><input type="text" value={invoice.customer.state} onChange={(e) => updateCustomer('state', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="State" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PIN Code</label><input type="text" value={invoice.customer.zipCode} onChange={(e) => updateCustomer('zipCode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="400001" /></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3">
              <button onClick={() => setIsCustomerFormOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">Cancel</button>
              <button onClick={() => setIsCustomerFormOpen(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">Save Customer</button>
            </div>
          </div>
        </div>
      )}

      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[80vh] flex flex-col border dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Select Products</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex-shrink-0">
              <div className="relative"><Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="text" placeholder="Search products by name, SKU, or category..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" /></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><span className="ml-2 text-gray-600 dark:text-gray-400">Loading products...</span></div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400"><Package className="h-12 w-12 mb-2 text-gray-300 dark:text-gray-600" /><p className="text-lg font-medium">No products found</p><p className="text-sm">Try adjusting your search terms</p></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 bg-white dark:bg-gray-700" onClick={() => addProductToInvoice(product)}>
                      <div className="flex-1 mb-2"><h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm">{product.name}</h4><p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p><div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"><span>SKU: {product.sku}</span><span className={`px-2 py-1 rounded-full text-xs ${product.stock > 10 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : product.stock > 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>{product.stock} in stock</span></div></div>
                      <div className="flex items-center justify-between"><span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</span><button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">Add</button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex justify-end space-x-3 flex-shrink-0">
              <button onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <DarkModeProvider>
    <TerminalProvider>
      <ModernBillingUI />
    </TerminalProvider>
  </DarkModeProvider>
);

export default App;