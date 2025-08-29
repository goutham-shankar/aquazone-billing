"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import TabManager from "../components/billing/TabManager";
import CustomerSection from "../components/billing/CustomerSection";
import ProductCatalog from "../components/billing/ProductCatalog";
import CartView from "../components/billing/CartView";
import DiscountDialog from "../components/billing/DiscountDialog";
import InvoicePreview from "../components/billing/InvoicePreview";
import PaymentSection from "../components/billing/PaymentSection";
import InvoiceComplete from "../components/billing/InvoiceComplete";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

type BillingTab = {
  id: string;
  name: string;
  hasUnsavedChanges: boolean;
};

type BillingStage = "products" | "customer" | "payment" | "complete";

function useTabs() {
  const [tabs, setTabs] = useState<BillingTab[]>([
    { id: crypto.randomUUID(), name: "New Bill", hasUnsavedChanges: false },
  ]);
  const [activeId, setActiveId] = useState<string>(tabs[0].id);

  useEffect(() => {
    if (!tabs.find((t) => t.id === activeId) && tabs.length)
      setActiveId(tabs[0].id);
  }, [tabs, activeId]);

  const activeIndex = useMemo(
    () => tabs.findIndex((t) => t.id === activeId),
    [tabs, activeId]
  );

  const add = useCallback(() => {
    const t: BillingTab = {
      id: crypto.randomUUID(),
      name: "New Bill",
      hasUnsavedChanges: false,
    };
    setTabs((prev) => [...prev, t]);
    setActiveId(t.id);
  }, []);

  const close = useCallback((id: string) => {
    setTabs((prev) =>
      prev.length > 1 ? prev.filter((t) => t.id !== id) : prev
    );
  }, []);

  const focusIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < tabs.length) setActiveId(tabs[index].id);
    },
    [tabs]
  );

  const cycle = useCallback(
    (dir: 1 | -1) => {
      if (!tabs.length) return;
      const idx = tabs.findIndex((t) => t.id === activeId);
      const next = (idx + dir + tabs.length) % tabs.length;
      setActiveId(tabs[next].id);
    },
    [tabs, activeId]
  );

  return {
    tabs,
    activeId,
    activeIndex,
    add,
    close,
    setActiveId,
    focusIndex,
    cycle,
  };
}

export default function BillingWorkspace() {
  const {
    tabs,
    activeId,
    activeIndex,
    add,
    close,
    setActiveId,
    focusIndex,
    cycle,
  } = useTabs();
  const { user } = useAuth();

  // Per-tab billing state
  type Customer = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    billingAddress?: {
      text?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
    shippingAddress?: {
      text?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  };
  type CartItem = { id: string; name: string; price: number; qty: number; stock: number };
  type BillingState = {
    customer?: Customer;
    items: CartItem[];
    discountAmount: number;
    taxPercent: number;
    stage: BillingStage;
    invoiceId?: string;
    invoiceNumber?: string;
  };

  const [byTab, setByTab] = useState<Record<string, BillingState>>({});
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  // Ensure state exists for each tab
  useEffect(() => {
    setByTab((prev) => {
      const next = { ...prev };
      for (const t of tabs) {
        if (!next[t.id]) {
          next[t.id] = {
            items: [],
            discountAmount: 0,
            taxPercent: 18,
            stage: "products",
          };
        }
      }
      // prune closed tabs
      for (const id of Object.keys(next)) {
        if (!tabs.find((t) => t.id === id)) delete next[id];
      }
      return next;
    });
  }, [tabs]);

  const state = byTab[activeId] ?? {
    items: [],
    discountAmount: 0,
    taxPercent: 18,
    stage: "products" as BillingStage,
  };

  const setState = useCallback(
    (partial: Partial<BillingState>) => {
      setByTab((prev) => ({
        ...prev,
        [activeId]: { ...prev[activeId], ...partial },
      }));
    },
    [activeId]
  );

  const setCustomer = useCallback(
    (c?: Customer) => setState({ customer: c }),
    [setState]
  );

  const addProduct = useCallback(
    (p: { id: string; name: string; price?: number; stock?: number }) => {
      const price = Number(p.price ?? 0);
      const stock = Number(p.stock ?? 0);
      
      if (!p.id || !p.name) return;
      
      if (stock <= 0) {
        toast.error('This product is out of stock');
        return;
      }
      
      setByTab((prev) => {
        const cur = prev[activeId] ?? {
          items: [],
          discountAmount: 0,
          taxPercent: 18,
          stage: "products" as BillingStage,
        };
        const existing = cur.items.find((i) => i.id === p.id);
        
        if (existing) {
          if (existing.qty >= stock) {
            toast.error('Cannot add more items. Maximum available quantity reached.');
            return prev;
          }
          const items = cur.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
          return { ...prev, [activeId]: { ...cur, items } };
        } else {
          const items = [...cur.items, { id: p.id, name: p.name, price, qty: 1, stock }];
          return { ...prev, [activeId]: { ...cur, items } };
        }
      });
    },
    [activeId]
  );

  const removeItem = useCallback(
    (id: string) =>
      setByTab((prev) => {
        const cur = prev[activeId];
        if (!cur) return prev;
        return {
          ...prev,
          [activeId]: { ...cur, items: cur.items.filter((i) => i.id !== id) },
        };
      }),
    [activeId]
  );

  const changeQty = useCallback(
    (id: string, delta: number) =>
      setByTab((prev) => {
        const cur = prev[activeId];
        if (!cur) return prev;
        const items = cur.items.map((i) => {
          if (i.id === id) {
            const newQty = i.qty + delta;
            if (newQty < 1) return { ...i, qty: 1 };
            if (newQty > i.stock) {
              toast.error('Cannot add more items. Maximum available quantity reached.');
              return i;
            }
            return { ...i, qty: newQty };
          }
          return i;
        });
        return { ...prev, [activeId]: { ...cur, items } };
      }),
    [activeId]
  );

  const subTotal = useMemo(
    () => state.items.reduce((s, i) => s + i.price * i.qty, 0),
    [state.items]
  );
  const discountAmount = Math.min(state.discountAmount, subTotal);
  const taxable = Math.max(0, subTotal - discountAmount);
  const tax =
    Math.round(((taxable * (state.taxPercent || 0)) / 100) * 100) / 100;
  const total = Math.max(0, Math.round((taxable + tax) * 100) / 100);

  // Navigation between stages
  const proceedToCustomer = useCallback(() => {
    if (state.items.length === 0) {
      toast.error("Add products to cart first");
      return;
    }
    setState({ stage: "customer" });
  }, [state.items.length, setState]);

  const proceedToPayment = useCallback(() => {
    if (!state.customer) {
      toast.error("Please select a customer");
      return;
    }
    setState({ stage: "payment" });
  }, [state.customer, setState]);

  const backToProducts = useCallback(
    () => setState({ stage: "products" }),
    [setState]
  );
  const backToCustomer = useCallback(
    () => setState({ stage: "customer" }),
    [setState]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac/i.test(navigator.platform);
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrMeta && e.key.toLowerCase() === "n") {
        e.preventDefault();
        add();
        return;
      }
      if (ctrlOrMeta && e.key.toLowerCase() === "w") {
        e.preventDefault();
        if (tabs.length <= 1) {
          toast.error("Can't close the last tab");
        } else {
          close(activeId);
        }
        return;
      }
      if (ctrlOrMeta && e.key === "Tab") {
        e.preventDefault();
        cycle(e.shiftKey ? -1 : 1);
        return;
      }
      if (ctrlOrMeta && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        focusIndex(Number(e.key) - 1);
        return;
      }
      if (ctrlOrMeta && e.key === "Enter") {
        e.preventDefault();
        if (state.stage === "products") {
          proceedToCustomer();
        } else if (state.stage === "customer") {
          proceedToPayment();
        }
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    add,
    close,
    cycle,
    focusIndex,
    activeId,
    tabs.length,
    state.stage,
    proceedToCustomer,
    proceedToPayment,
  ]);

  // Global search pick listener
  useEffect(() => {
    const onPick = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: string; item: any };
      if (!detail) return;
      if (detail.kind === "customer") {
        const c: Customer = {
          id: detail.item?._id || detail.item?.id,
          name: detail.item?.name,
          email: detail.item?.email,
          phone: detail.item?.phone,
          billingAddress: detail.item?.address || detail.item?.billingAddress,
          shippingAddress: detail.item?.shippingAddress || detail.item?.address,
        };
        setCustomer(c);
        toast.success(`Customer selected: ${c.name || c.email || c.phone}`);
      } else if (detail.kind === "product") {
        const price =
          detail.item?.retailPrice ??
          detail.item?.price ??
          detail.item?.wholesalePrice ??
          0;
        addProduct({
          id: detail.item?._id || detail.item?.id,
          name: detail.item?.name,
          price: Number(price),
        });
        toast.success(`Product added: ${detail.item?.name}`);
      }
    };
    window.addEventListener("global-search-pick", onPick as any);
    return () =>
      window.removeEventListener("global-search-pick", onPick as any);
  }, [addProduct, setCustomer]);

  const handleCreateInvoice = useCallback(async () => {
    if (!state.items.length) {
      toast.error("Cart is empty");
      return;
    }
    if (!state.customer) {
      toast.error("Please select a customer");
      return;
    }

    try {
      const body = {
        amount: { subTotal, tax: tax, total },
        address: {
          billing: state.customer.billingAddress || {},
          shipping:
            state.customer.shippingAddress ||
            state.customer.billingAddress ||
            {},
        },
        items: state.items.map((i) => ({
          _id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.qty,
        })),
        discounts: state.discountAmount
          ? [{ name: "flat", amount: state.discountAmount }]
          : [],
        customer: state.customer.id,
        type: "bill",
        salesman: user?.id,
      };

      const res = await api.invoices.create(body);
      if (!res.success) {
        throw new Error((res as any).error || "Failed to create invoice");
      }

      toast.success("Invoice created successfully");
      setState({
        stage: "payment",
        invoiceId: res.data._id,
        invoiceNumber: res.data.invoiceNumber || res.data.number || `INV-${Date.now()}`,
      });
    } catch (e: any) {
      toast.error(e?.message || "Invoice creation failed");
    }
  }, [
    state.items,
    state.discountAmount,
    state.customer,
    subTotal,
    tax,
    total,
    setState,
  ]);

  const handlePaymentComplete = useCallback(() => {
    toast.success("Payment completed successfully");
    setState({ stage: "complete" });
  }, [setState]);

  const handleBackFromComplete = useCallback(() => {
    setState({ stage: "payment" });
  }, [setState]);

  const handleNewBill = useCallback(() => {
    // Reset current tab to new bill state
    setByTab((prev) => ({
      ...prev,
      [activeId]: {
        items: [],
        discountAmount: 0,
        taxPercent: 18,
        stage: "products",
        customer: undefined,
        invoiceId: undefined,
        invoiceNumber: undefined,
      },
    }));
  }, [activeId]);

  const handleCancelPayment = useCallback(() => {
    setState({ stage: "customer" });
  }, [setState]);

  return (
    <div className="w-full h-[95%] flex flex-col gap-2 p-4">
      <TabManager
        tabs={tabs}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={add}
        onClose={close}
      />

      <div className="h-full min-h-0">
        {state.stage === "products" && (
          <div className="h-full grid grid-cols-2 gap-4">
            {/* Left side - Cart with discount button */}
            <div className="flex flex-col gap-4">
              <CartView
                className="bg-white/80 border-slate-200 flex-1"
                items={state.items}
                onInc={(id: string) => changeQty(id, 1)}
                onDec={(id: string) => changeQty(id, -1)}
                onRemove={(id: string) => removeItem(id)}
              />
              <InvoicePreview
                subTotal={subTotal}
                discountAmount={discountAmount}
                taxPercent={state.taxPercent}
                taxAmount={tax}
                total={total}
                onCreate={proceedToCustomer}
                onDiscountClick={() => setShowDiscountDialog(true)}
                showDiscountButton={true}
              />
            </div>

            {/* Right side - Product catalog full height */}
            <ProductCatalog
              className="bg-white/80 border-slate-200 h-full"
              onAdd={(p: any) => addProduct(p)}
              cartItems={state.items}
            />
          </div>
        )}

        {state.stage === "customer" && (
          <div className="h-full grid grid-rows-[1fr,auto] gap-4">
            <CustomerSection
              className="bg-white/80 border-slate-200 h-full"
              customer={state.customer}
              onCustomerSelect={setCustomer}
              onClear={() => setCustomer(undefined)}
            />
            <div className="bg-white/80 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={backToProducts}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
                >
                  Back to Products
                </button>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Total: ₹{total.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {state.items.length} items
                  </div>
                </div>
                <button
                  onClick={handleCreateInvoice}
                  disabled={!state.customer}
                  className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Invoice & Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {state.stage === "payment" && state.invoiceId && (
          <PaymentSection
            className="bg-white/80 border-slate-200 h-full"
            invoiceId={state.invoiceId}
            totalAmount={total}
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleCancelPayment}
          />
        )}

        {state.stage === "complete" && state.invoiceId && (
          <InvoiceComplete
            className="fixed inset-0 z-50"
            invoiceId={state.invoiceId}
            invoiceNumber={state.invoiceNumber || `INV-${Date.now()}`}
            customer={state.customer}
            items={state.items}
            subTotal={subTotal}
            discountAmount={discountAmount}
            taxPercent={state.taxPercent}
            taxAmount={tax}
            total={total}
            onBack={handleBackFromComplete}
            onNewBill={handleNewBill}
          />
        )}
      </div>

      {/* Discount Dialog */}
      <DiscountDialog
        isOpen={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
        discountAmount={state.discountAmount}
        taxPercent={state.taxPercent}
        onChangeDiscountAmount={(v: number) =>
          setState({ discountAmount: Math.max(0, v) })
        }
        onChangeTaxPercent={(v: number) =>
          setState({ taxPercent: Math.max(0, v) })
        }
      />
    </div>
  );
}
