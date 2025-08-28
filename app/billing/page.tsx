"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import {
  Plus,
  Search,
  User,
  X,
  Edit3,
  ShoppingCart,
  Package,
  Monitor,
  Printer,
} from "lucide-react";
import ImageFallback from "../components/ImageFallback";
import {
  Page as PDFPage,
  Text,
  View,
  Document,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import CustomerFormModal, {
  type Customer as LegacyCustomer,
} from "../components/CustomerForm";
import { useRouter } from "next/navigation";
import NavTabs from "../components/NavTabs";
import {
  getProducts,
  createInvoice,
  createCustomer,
  updateCustomer as updateCustomerApi,
  getCustomerByPhone,
} from "../lib/api";
import { useAuth } from "../context/Authcontext";
import toast from "react-hot-toast";

// TYPES
type Product = {
  id: string;
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
  id: string;
  itemCode: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  lineTotal: number;
  image?: string;
};
type CustomerAddresses = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
};
type Customer = LegacyCustomer & {
  billingAddress?: CustomerAddresses;
  shippingAddress?: CustomerAddresses;
  sameShipping?: boolean;
};
type UserType = { uid: string; email: string; displayName: string };
type Terminal = {
  id: string;
  name: string;
  invoice: {
    billType: "Invoice" | "Quotation";
    invoiceNumber: string;
    date: string;
    dueDate: string;
    terms: string;
    salesRep: string;
    customer: Customer;
    items: InvoiceItem[];
  };
  createdAt: Date;
  lastActivity: Date;
};

// CONTEXTS
const TerminalContext = createContext({
  terminals: [] as Terminal[],
  activeTerminalId: "",
  addTerminal: () => {},
  removeTerminal: (_id: string) => {},
  setActiveTerminal: (_id: string) => {},
  updateTerminalInvoice: (_id: string, _invoice: any) => {},
});
const useTerminals = () => useContext(TerminalContext);

// AUTH HELPERS
const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.error(e);
  }
};
const getAuthToken = async () => {
  const u = auth.currentUser;
  if (!u) return null;
  return u.getIdToken();
};

// map API product dto to internal product shape
const mapProducts = (arr: any[]): Product[] =>
  arr.map((p: any) => ({
    id: p._id || p.id,
    name: p.name || "",
    description: p.description || "",
    price: parseFloat(p.price || 0),
    category:
      typeof p.category === "object" && p.category?.name
        ? p.category.name
        : p.category || "Uncategorized",
    stock: parseInt(p.stock || 0),
    image: p.image || "",
    sku: p.sku || "",
    barcode: p.barcode || "",
    pluCode: p.pluCode || "",
    taxRate: parseFloat(p.taxRate || 0.18),
    taxIncluded: !!p.taxIncluded,
    wholesalePrice: parseFloat(p.wholesalePrice || 0),
    retailPrice: parseFloat(p.retailPrice || 0),
    subCategory: p.subCategory || "",
  }));

// PROVIDERS
const TerminalProvider = ({ children }: { children: React.ReactNode }) => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState("");
  const createNewInvoice = () => ({
    billType: "Invoice" as "Invoice" | "Quotation",
    invoiceNumber: `INV${new Date().getFullYear()}${String(Date.now()).slice(
      -6
    )}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    terms: "Net 30",
    salesRep: "Sales Rep",
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      taxId: "",
    } as Customer,
    items: [],
  });
  const nextTerminalNumber = (existing: Terminal[]) => {
    const used = new Set(
      existing.map((t) => {
        const m = t.name.match(/Terminal\s+(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
    );
    let n = 1;
    while (used.has(n)) n++;
    return n;
  };
  const addTerminal = () => {
    const now = new Date();
    const num = nextTerminalNumber(terminals);
    const t: Terminal = {
      id: `t_${Date.now()}`,
      name: `Terminal ${num}`,
      invoice: createNewInvoice(),
      createdAt: now,
      lastActivity: now,
    };
    setTerminals((p) => [...p, t]);
    setActiveTerminalId(t.id);
  };
  const removeTerminal = (id: string) => {
    if (terminals.length === 1) return;
    setTerminals((p) => {
      const f = p.filter((t) => t.id !== id);
      if (activeTerminalId === id && f[0]) setActiveTerminalId(f[0].id);
      return f;
    });
  };
  const setActiveTerminal = (id: string) => {
    setActiveTerminalId(id);
    setTerminals((p) =>
      p.map((t) => (t.id === id ? { ...t, lastActivity: new Date() } : t))
    );
  };
  const updateTerminalInvoice = (id: string, invoice: any) =>
    setTerminals((p) =>
      p.map((t) =>
        t.id === id ? { ...t, invoice, lastActivity: new Date() } : t
      )
    );
  useEffect(() => {
    if (terminals.length === 0) {
      const now = new Date();
      const t: Terminal = {
        id: "t_init",
        name: "Terminal 1",
        invoice: createNewInvoice(),
        createdAt: now,
        lastActivity: now,
      };
      setTerminals([t]);
      setActiveTerminalId(t.id);
    }
  }, [terminals.length]);
  return (
    <TerminalContext.Provider
      value={{
        terminals,
        activeTerminalId,
        addTerminal,
        removeTerminal,
        setActiveTerminal,
        updateTerminalInvoice,
      }}
    >
      {children}
    </TerminalContext.Provider>
  );
};

// PDF STYLES & COMPONENT
const pdfStyles = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 11, padding: 30, lineHeight: 1.5 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  companyName: { fontSize: 20, fontWeight: "bold" },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    alignItems: "center",
  },
  colDesc: { width: "50%", padding: 4 },
  colQty: { width: "10%", padding: 4 },
  colPrice: { width: "20%", padding: 4, textAlign: "right" },
  colTotal: { width: "20%", padding: 4, textAlign: "right" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 3,
  },
});
interface InvoicePDFProps {
  invoice: Terminal["invoice"];
  totals: { subtotal: number; tax: number; total: number };
  formatCurrency: (n: number) => string;
}
const InvoicePDF = ({ invoice, totals, formatCurrency }: InvoicePDFProps) => (
  <Document>
    <PDFPage size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.companyName}>New Golden Aquazone</Text>
        <View style={{ textAlign: "right" }}>
          <Text>
            {invoice.billType} #: {invoice.invoiceNumber}
          </Text>
          <Text>
            Date: {new Date(invoice.date).toLocaleDateString("en-IN")}
          </Text>
        </View>
      </View>
      <View style={{ marginBottom: 10 }}>
        <Text style={{ fontWeight: "bold" }}>Bill To:</Text>
        <Text>{invoice.customer.name}</Text>
        <Text>
          {invoice.customer.billingAddress?.address || invoice.customer.address}
          , {invoice.customer.billingAddress?.city || invoice.customer.city}
        </Text>
        <Text>
          {invoice.customer.billingAddress?.state || invoice.customer.state}{" "}
          {invoice.customer.billingAddress?.zipCode || invoice.customer.zipCode}
        </Text>
      </View>
      <View>
        {invoice.items.map((it: InvoiceItem) => (
          <View style={pdfStyles.tableRow} key={it.id}>
            <Text style={pdfStyles.colDesc}>{it.name}</Text>
            <Text style={pdfStyles.colQty}>{it.quantity}</Text>
            <Text style={pdfStyles.colPrice}>{formatCurrency(it.price)}</Text>
            <Text style={pdfStyles.colTotal}>
              {formatCurrency(it.lineTotal)}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ marginTop: 10 }}>
        <View style={pdfStyles.summaryRow}>
          <Text>Subtotal</Text>
          <Text>{formatCurrency(totals.subtotal)}</Text>
        </View>
        <View style={pdfStyles.summaryRow}>
          <Text>GST (18%)</Text>
          <Text>{formatCurrency(totals.tax)}</Text>
        </View>
        <View style={pdfStyles.summaryRow}>
          <Text>Total</Text>
          <Text>{formatCurrency(totals.total)}</Text>
        </View>
      </View>
    </PDFPage>
  </Document>
);

// UI SUB COMPONENTS
const TerminalTabs = () => {
  const {
    terminals,
    activeTerminalId,
    addTerminal,
    removeTerminal,
    setActiveTerminal,
  } = useTerminals();
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center space-x-1 overflow-x-auto">
        {terminals.map((t) => (
          <div
            key={t.id}
            onClick={() => setActiveTerminal(t.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors min-w-0 ${
              activeTerminalId === t.id
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-b-2 border-blue-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span className="text-sm font-medium truncate">{t.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 bg-gray-200 dark:bg-gray-600 px-1 rounded">
              {t.invoice.items.length}
            </span>
            {terminals.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTerminal(t.id);
                }}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTerminal}
          className="flex items-center space-x-1 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">New Terminal</span>
        </button>
      </div>
    </div>
  );
};

// Navbar replaced by shared NavTabs component

// Bill To section with bill type selector
const BillToSection = ({
  customer,
  onEditCustomer,
  billType,
  onUpdateBillType,
}: {
  customer: Customer;
  onEditCustomer: () => void;
  billType: string;
  onUpdateBillType: (t: string) => void;
}) => {
  const billing: CustomerAddresses = customer.billingAddress || {
    address: customer.address,
    city: customer.city,
    state: customer.state,
    zipCode: customer.zipCode,
  };
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0 border dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <select
            value={billType}
            onChange={(e) => onUpdateBillType(e.target.value)}
            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium"
          >
            <option value="Invoice">Invoice</option>
            <option value="Quotation">Estimate</option>
          </select>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <User className="h-4 w-4 mr-1 text-blue-600 dark:text-blue-400" />
            Bill To
          </h3>
        </div>
        <button
          onClick={onEditCustomer}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Edit3 className="h-4 w-4 mr-1" />
          {customer.name ? "Edit Customer" : "Add Customer (Ctrl+I)"}
        </button>
      </div>
      {customer.name && (
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {customer.name}
          </p>
          {customer.phone && <p>{customer.phone}</p>}
          {customer.email && <p>{customer.email}</p>}
          {billing.address && (
            <p>
              {billing.address}, {billing.city} {billing.state}{" "}
              {billing.zipCode}
            </p>
          )}
          {customer.taxId && (
            <p className="font-mono text-xs pt-1">GSTIN: {customer.taxId}</p>
          )}
        </div>
      )}
    </section>
  );
};

// MAIN BILLING UI
const BillingUI = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [openCustomerTerminalId, setOpenCustomerTerminalId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const router = useRouter();
  const { terminals, activeTerminalId, updateTerminalInvoice, addTerminal } =
    useTerminals() as any;
  const { userId } = useAuth();
  const activeTerminal = terminals.find((t: any) => t.id === activeTerminalId);
  const invoice = activeTerminal?.invoice;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser({
          uid: u.uid,
          email: u.email || "",
          displayName: u.displayName || u.email || "User",
        });
        try {
          await loadProducts();
        } catch (e: any) {
          console.error(e);
        }
      } else {
        setUser(null);
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);
  const loadProducts = async (s: string = "") => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const raw = await getProducts({ search: s });
      setProducts(mapProducts(raw));
    } catch (e: any) {
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (searchTimeout) clearTimeout(searchTimeout);
      const t = setTimeout(() => loadProducts(term), 400);
      setSearchTimeout(t);
    },
    [searchTimeout]
  );
  const addProductToInvoice = (prod: Product) => {
    if (!activeTerminal || !invoice) return;
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      itemCode: prod.sku,
      name: prod.name,
      description: prod.description,
      quantity: 1,
      price: prod.price,
      lineTotal: prod.price,
      image: prod.image,
    };
    updateTerminalInvoice(activeTerminal.id, {
      ...invoice,
      items: [...invoice.items, newItem],
    });
    setIsProductModalOpen(false);
  };
  const updateInvoice = (updates: any) => {
    if (!activeTerminal || !invoice) return;
    updateTerminalInvoice(activeTerminal.id, { ...invoice, ...updates });
  };
  const removeItem = (id: string) => {
    if (!invoice) return;
    updateInvoice({ items: invoice.items.filter((i: any) => i.id !== id) });
  };
  const setItemQuantity = (id: string, qty: number) => {
    if (!invoice) return;
    const q = Math.max(1, qty || 1);
    const items = invoice.items.map((i: any) =>
      i.id === id ? { ...i, quantity: q, lineTotal: q * i.price } : i
    );
    updateInvoice({ items });
  };
  const updateCustomer = (field: keyof Customer, value: any) => {
    if (!invoice) return; // handle same shipping logic
    let updated = { ...invoice.customer, [field]: value } as Customer;
    if (
      field.startsWith("billingAddress.") ||
      field.startsWith("shippingAddress.")
    ) {
      const [section, key] = field.split(".") as [
        keyof Customer,
        keyof CustomerAddresses
      ];
      const sectionObj = {
        ...(updated[section] as CustomerAddresses),
        [key]: value,
      };
      (updated as any)[section] = sectionObj;
      if (updated.sameShipping && section === "billingAddress") {
        updated.shippingAddress = { ...sectionObj };
      }
    }
    updateInvoice({ customer: updated });
  };
  const calculateTotals = () => {
    if (!invoice) return { subtotal: 0, tax: 0, total: 0 };
    const subtotal = invoice.items.reduce(
      (s: number, it: any) => s + it.lineTotal,
      0
    );
    const tax = invoice.items.reduce(
      (s: number, it: any) => s + it.lineTotal * 0.18,
      0
    );
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  const totals = calculateTotals();
  const formatCurrency = (a: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(a);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setGeneratingPdf(true);
    try {
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          totals={totals}
          formatCurrency={formatCurrency}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      toast.error("PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };
  const saveCustomerBackend = async () => {
    if (!invoice) return;
    const c = invoice.customer;
    if (!c.phone || !c.name) return;
    try {
      const payload = {
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: {
          text: c.billingAddress?.address || c.address,
          city: c.billingAddress?.city || c.city,
          state: c.billingAddress?.state || c.state,
          zip: c.billingAddress?.zipCode || c.zipCode,
        },
      };
      // Follow API doc: POST to create, PUT /billing/customer/:id to update existing
      const existing = await getCustomerByPhone(c.phone);
      if (existing?._id) {
        await updateCustomerApi(existing._id, payload);
        toast.success("Customer updated");
      } else {
        await createCustomer(payload as any);
        toast.success("Customer created");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Customer save failed");
    }
  };
  const handleSaveInvoice = async () => {
    if (!invoice) return;
    setSaving(true);
    try {
      // Build API-compliant payload (see api.md Invoice POST spec)
      const amount = {
        subTotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      };
      const billingAddressText =
        invoice.customer.billingAddress?.address || invoice.customer.address;
      const billingCity =
        invoice.customer.billingAddress?.city || invoice.customer.city;
      const billingState =
        invoice.customer.billingAddress?.state || invoice.customer.state;
      const billingZip =
        invoice.customer.billingAddress?.zipCode || invoice.customer.zipCode;
      const address = {
        billing: `${billingAddressText}, ${billingCity}, ${billingState} ${billingZip}`,
        shipping: `${billingAddressText}, ${billingCity}, ${billingState} ${billingZip}`,
      };
      const items = invoice.items.map((i: any) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      }));
      // customer needs to be ObjectId in real backend; we attempt lookup by phone first
      let customerId: string | undefined;
      try {
        const existing = invoice.customer.phone
          ? await getCustomerByPhone(invoice.customer.phone)
          : null;
        if (existing?._id) customerId = existing._id;
      } catch {}
      const payload: any = {
        amount,
        address,
        items,
        customer: customerId,
        type: invoice.billType === "Quotation" ? "estimate" : "bill",
        salesman: userId,
      };
      await createInvoice(payload);
      toast.success("Invoice saved");
    } catch (e: any) {
      console.error(e);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!invoice) return;
    try {
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          totals={totals}
          formatCurrency={formatCurrency}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url);
      if (!newWindow) {
        // fallback: trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      // allow window print if opened
      setTimeout(() => {
        try {
          newWindow?.print();
        } catch {}
      }, 400);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (e: any) {
      console.error(e);
      toast.error("Print failed");
    }
  };
  // Global shortcuts effect MUST come before conditional returns so hook order is stable
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey) {
        if (key === "p") {
          e.preventDefault();
          handlePrintInvoice();
        } else if (key === "k") {
          e.preventDefault();
          setIsProductModalOpen((p) => !p);
        } else if (key === "i") {
          e.preventDefault();
          setOpenCustomerTerminalId((prev) =>
            prev === activeTerminalId ? null : activeTerminalId
          );
        } else if (key === "s") {
          e.preventDefault();
          handleSaveInvoice();
        } else if (key === "t") {
          e.preventDefault();
          addTerminal();
        } else if (key === "n") {
          // prevent browser new window
          e.preventDefault();
          addTerminal(); // treat Ctrl+N same as new terminal for user convenience
        }
      }
      if (e.key === "Escape") {
        if (isProductModalOpen) setIsProductModalOpen(false);
        if (openCustomerTerminalId) setOpenCustomerTerminalId(null);
      }
    };
    window.addEventListener("keydown", handler);
    const showShortcuts = () => setIsKeyboardHelpOpen(true);
    window.addEventListener("show-shortcuts", showShortcuts as any);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("show-shortcuts", showShortcuts as any);
    };
  }, [
    isProductModalOpen,
    openCustomerTerminalId,
    activeTerminalId,
    addTerminal,
    handlePrintInvoice,
  ]);

  if (!user)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!invoice) return null;

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <NavTabs userName={user.displayName} onSignOut={signOut} />
      <TerminalTabs />
      <main className="flex-1 flex gap-3 p-3 overflow-hidden" tabIndex={0}>
        <div className="flex-1 flex flex-col gap-3 overflow-hidden">
          <BillToSection
            customer={invoice.customer}
            billType={invoice.billType}
            onUpdateBillType={(t) => updateInvoice({ billType: t })}
            onEditCustomer={() => setOpenCustomerTerminalId(activeTerminalId)}
          />
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-1 flex flex-col overflow-hidden border dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-1 text-blue-600 dark:text-blue-400" />
                Items ({invoice.items.length})
              </h3>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsProductModalOpen(true);
                  }}
                  className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold shadow text-[15px]"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsKeyboardHelpOpen(true)}
                  className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Keyboard Shortcuts
                </button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-2 py-2 px-2 bg-gray-50 dark:bg-gray-700 rounded text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex-shrink-0">
              <div className="col-span-2 text-center">Image</div>
              <div className="col-span-4">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total (incl GST)</div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {invoice.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <Package className="h-10 w-10 mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-base">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {invoice.items.map((it: any) => {
                    const taxTotal = it.lineTotal + it.lineTotal * 0.18;
                    return (
                      <div
                        key={it.id}
                        className="grid grid-cols-12 gap-2 py-2.5 px-2 bg-gray-50 dark:bg-gray-700 rounded items-center text-xs sm:text-sm"
                      >
                        <div className="col-span-2 flex items-center justify-center">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-gray-300 dark:bg-gray-600 rounded text-[10px] font-mono">
                              {it.itemCode || "—"}
                            </div>
                          )}
                        </div>
                        <div className="col-span-4">
                          <p className="font-semibold truncate text-[13px] sm:text-sm">
                            {it.name}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {it.description}
                          </p>
                        </div>
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(it.id, it.quantity - 1)
                            }
                            disabled={it.quantity <= 1}
                            className="h-7 w-7 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-base font-bold disabled:opacity-40"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) =>
                              setItemQuantity(
                                it.id,
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-center text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(it.id, it.quantity + 1)
                            }
                            className="h-7 w-7 flex items-center justify-center rounded bg-blue-600 text-white text-base font-bold hover:bg-blue-700"
                          >
                            +
                          </button>
                        </div>
                        <div className="col-span-2 text-right text-[13px] sm:text-sm">
                          {formatCurrency(it.price)}
                        </div>
                        <div className="col-span-2 text-right font-semibold flex items-center justify-end gap-2 text-[13px] sm:text-sm">
                          {formatCurrency(taxTotal)}
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
        <aside className="w-80 flex flex-col gap-3 overflow-hidden">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 flex-shrink-0 border dark:border-gray-700">
            <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Summary
            </h3>
            <div className="space-y-2 text-sm sm:text-[15px]">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-semibold">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  GST (18%)
                </span>
                <span className="font-semibold">
                  {formatCurrency(totals.tax)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-600">
                <span className="font-bold text-xl">Total</span>
                <span className="font-extrabold text-3xl text-blue-600 dark:text-blue-400 tracking-tight">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <button
                onClick={handlePrintInvoice}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold flex items-center justify-center gap-2 text-[15px]"
              >
                <Printer className="h-5 w-5" />
                Print (Ctrl+P)
              </button>
              <button
                disabled={
                  saving ||
                  !invoice.customer.name ||
                  !(
                    invoice.customer.billingAddress?.zipCode ||
                    invoice.customer.zipCode
                  )
                }
                onClick={handleSaveInvoice}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded text-sm font-semibold text-center text-[15px]"
              >
                {saving ? "Saving..." : "Save (Ctrl+S)"}
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={generatingPdf}
                className="w-full py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-60 text-white rounded text-sm font-medium text-center text-[15px]"
              >
                {generatingPdf ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </section>
        </aside>
      </main>
      <CustomerFormModal
        isOpen={openCustomerTerminalId === activeTerminalId}
        customer={invoice.customer as any}
        onClose={async () => {
          const billing = (invoice.customer as any).billingAddress;
          if (billing) {
            updateInvoice({
              customer: {
                ...invoice.customer,
                address: billing.address,
                city: billing.city,
                state: billing.state,
                zipCode: billing.zipCode,
              },
            });
          }
          setOpenCustomerTerminalId(null);
        }}
        onUpdateCustomer={(f, v) => updateCustomer(f as any, v)}
        onSave={async () => {
          const billing = (invoice.customer as any).billingAddress;
          if (billing) {
            updateInvoice({
              customer: {
                ...invoice.customer,
                address: billing.address,
                city: billing.city,
                state: billing.state,
                zipCode: billing.zipCode,
              },
            });
          }
          await saveCustomerBackend();
        }}
      />
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl w-[95vw] h-[90vh] flex flex-col border border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-blue-400">
                Select Products
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-700">
              <div className="relative max-w-xl">
                <Search className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products (name / sku / category)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded bg-gray-800 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Package className="h-14 w-14 mb-4 text-gray-600" />
                  <p className="text-lg font-medium">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-5">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => addProductToInvoice(p)}
                      className="group border border-gray-700 rounded-lg p-4 bg-gray-800 hover:border-blue-600 cursor-pointer flex flex-col"
                    >
                      <ImageFallback
                        src={p.image}
                        alt={p.name}
                        className="h-40 w-full mb-3"
                      />
                      <h4 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-blue-400 mb-1">
                        {p.name}
                      </h4>
                      <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 min-h-[30px]">
                        {p.description || "—"}
                      </p>
                      <div className="mt-auto text-sm font-bold text-blue-400">
                        {formatCurrency(p.price)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800 flex justify-end">
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 text-sm rounded bg-gray-700 hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isKeyboardHelpOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]"
          onClick={() => setIsKeyboardHelpOpen(false)}
        >
          <div
            className="bg-gray-900 text-gray-100 rounded-lg shadow-2xl w-[480px] max-w-[90vw] p-6 border border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => setIsKeyboardHelpOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-blue-400">
              Keyboard Shortcuts
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-400">Add / Close Product Modal</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Ctrl + K
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">
                  Add / Close Customer Modal
                </span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Ctrl + I
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">New Terminal</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Ctrl + T
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Save Invoice</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Ctrl + S
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Print Invoice</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Ctrl + P
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">Close Open Dialog</span>
                <span className="font-mono bg-gray-800 px-2 py-0.5 rounded">
                  Esc
                </span>
              </li>
            </ul>
            <div className="mt-5 text-right">
              <button
                onClick={() => setIsKeyboardHelpOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PageComponent = () => (
  <TerminalProvider>
    <BillingUI />
  </TerminalProvider>
);

export default PageComponent;
