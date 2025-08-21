"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import TabManager from "./components/billing/BillingWorkspace/TabManager";
import CustomerSection from "./components/billing/BillingWorkspace/CustomerSection";
import ProductCatalog from "./components/billing/BillingWorkspace/ProductCatalog";
import CartView from "./components/billing/BillingWorkspace/CartView";
import DiscountPanel from "./components/billing/BillingWorkspace/DiscountPanel";
import InvoicePreview from "./components/billing/BillingWorkspace/InvoicePreview";
import { api } from "@/lib/api";

type BillingTab = {
  id: string;
  name: string;
  hasUnsavedChanges: boolean;
};

function useTabs() {
  const [tabs, setTabs] = useState<BillingTab[]>([{ id: crypto.randomUUID(), name: "New Bill", hasUnsavedChanges: false }]);
  const [activeId, setActiveId] = useState<string>(tabs[0].id);

  useEffect(() => {
    if (!tabs.find(t => t.id === activeId) && tabs.length) setActiveId(tabs[0].id);
  }, [tabs, activeId]);

  const activeIndex = useMemo(() => tabs.findIndex(t => t.id === activeId), [tabs, activeId]);

  const add = useCallback(() => {
    const t: BillingTab = { id: crypto.randomUUID(), name: "New Bill", hasUnsavedChanges: false };
    setTabs(prev => [...prev, t]);
    setActiveId(t.id);
  }, []);

  const close = useCallback((id: string) => {
    setTabs(prev => (prev.length > 1 ? prev.filter(t => t.id !== id) : prev));
  }, []);

  const focusIndex = useCallback((index: number) => {
    if (index >= 0 && index < tabs.length) setActiveId(tabs[index].id);
  }, [tabs]);

  const cycle = useCallback((dir: 1 | -1) => {
    if (!tabs.length) return;
    const idx = tabs.findIndex(t => t.id === activeId);
    const next = (idx + dir + tabs.length) % tabs.length;
    setActiveId(tabs[next].id);
  }, [tabs, activeId]);

  return { tabs, activeId, activeIndex, add, close, setActiveId, focusIndex, cycle };
}

export default function BillingWorkspace() {
  const { tabs, activeId, activeIndex, add, close, setActiveId, focusIndex, cycle } = useTabs();

  // Per-tab billing state
  type Customer = { id: string; name?: string; email?: string; phone?: string };
  type CartItem = { id: string; name: string; price: number; qty: number };
  type BillingState = {
    customer?: Customer;
    items: CartItem[];
    discountAmount: number; // flat
    taxPercent: number; // e.g., 18
  };
  const [byTab, setByTab] = useState<Record<string, BillingState>>({});

  // Ensure state exists for each tab
  useEffect(() => {
    setByTab((prev) => {
      const next = { ...prev };
      for (const t of tabs) if (!next[t.id]) next[t.id] = { items: [], discountAmount: 0, taxPercent: 0 };
      // prune closed tabs
      for (const id of Object.keys(next)) if (!tabs.find((t) => t.id === id)) delete next[id];
      return next;
    });
  }, [tabs]);

  const state = byTab[activeId] ?? { items: [], discountAmount: 0, taxPercent: 0 };

  const setState = useCallback((partial: Partial<BillingState>) => {
    setByTab((prev) => ({ ...prev, [activeId]: { ...prev[activeId], ...partial } }));
  }, [activeId]);

  const setCustomer = useCallback((c?: Customer) => setState({ customer: c }), [setState]);
  const addProduct = useCallback((p: { id: string; name: string; price?: number }) => {
    const price = Number(p.price ?? 0);
    if (!p.id || !p.name) return;
    setByTab((prev) => {
      const cur = prev[activeId] ?? { items: [], discountAmount: 0, taxPercent: 0 };
      const existing = cur.items.find((i) => i.id === p.id);
      const items = existing
        ? cur.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...cur.items, { id: p.id, name: p.name, price, qty: 1 }];
      return { ...prev, [activeId]: { ...cur, items } };
    });
  }, [activeId]);
  const removeItem = useCallback((id: string) => setByTab((prev) => {
    const cur = prev[activeId];
    if (!cur) return prev;
    return { ...prev, [activeId]: { ...cur, items: cur.items.filter((i) => i.id !== id) } };
  }), [activeId]);
  const changeQty = useCallback((id: string, delta: number) => setByTab((prev) => {
    const cur = prev[activeId];
    if (!cur) return prev;
    const items = cur.items.map((i) => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
    return { ...prev, [activeId]: { ...cur, items } };
  }), [activeId]);

  const subTotal = useMemo(() => state.items.reduce((s, i) => s + i.price * i.qty, 0), [state.items]);
  const discountAmount = Math.min(state.discountAmount, subTotal);
  const taxable = Math.max(0, subTotal - discountAmount);
  const tax = Math.round((taxable * (state.taxPercent || 0) / 100) * 100) / 100; // percent to fraction then round 2 decimals
  const total = Math.max(0, Math.round((taxable + tax) * 100) / 100);

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
        handleCreateInvoice();
        return;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [add, close, cycle, focusIndex, activeId, tabs.length]);

  // Global search pick listener (placeholder hooks)
  useEffect(() => {
    const onPick = (e: Event) => {
      const detail = (e as CustomEvent).detail as { kind: string; item: any };
      if (!detail) return;
      if (detail.kind === "customer") {
        const c: Customer = { id: detail.item?._id || detail.item?.id, name: detail.item?.name, email: detail.item?.email, phone: detail.item?.phone };
        setCustomer(c);
        toast.success(`Customer selected: ${c.name || c.email || c.phone}`);
      } else if (detail.kind === "product") {
        const price = detail.item?.retailPrice ?? detail.item?.price ?? detail.item?.wholesalePrice ?? 0;
        addProduct({ id: detail.item?._id || detail.item?.id, name: detail.item?.name, price: Number(price) });
        toast.success(`Product added: ${detail.item?.name}`);
      }
    };
    window.addEventListener("global-search-pick", onPick as any);
    return () => window.removeEventListener("global-search-pick", onPick as any);
  }, [addProduct, setCustomer]);

  const handleCreateInvoice = useCallback(async () => {
    if (!state.items.length) {
      toast.error("Cart is empty");
      return;
    }
    try {
      const body = {
        amount: { subTotal, tax: tax, total },
        address: { billing: {}, shipping: {} },
        items: state.items.map(i => ({ _id: i.id, name: i.name, price: i.price, quantity: i.qty })),
        discounts: state.discountAmount ? [{ name: "flat", amount: state.discountAmount }] : [],
        customer: state.customer?.id,
        type: "bill",
      } as any;
      const res = await api.invoices.create(body);
      if (!res.success) {
        throw new Error((res as any).error || "Failed to create invoice");
      }
      toast.success("Invoice created");
      // Reset current tab state
      setByTab((prev) => ({ ...prev, [activeId]: { items: [], discountAmount: 0, taxPercent: state.taxPercent, customer: state.customer } }));
    } catch (e: any) {
      toast.error(e?.message || "Invoice failed");
    }
  }, [state.items, state.discountAmount, state.taxPercent, state.customer, subTotal, tax, total, activeId]);

  return (
    <div className="w-full px-6 py-4 h-full grid grid-rows-[auto,1fr] gap-4">
      <TabManager
        tabs={tabs}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={add}
        onClose={close}
      />

      <div className="h-full min-h-0 grid grid-rows-[1fr,1fr,120px] gap-4">
        <div className="grid grid-cols-3 gap-4 min-h-0">
          <CustomerSection
            className="col-span-1 bg-white/80 border-slate-200 h-full"
            customer={state.customer}
            onClear={() => setCustomer(undefined)}
          />
          <ProductCatalog className="col-span-2 bg-white/80 border-slate-200 h-full" onAdd={(p) => addProduct(p)} />
        </div>

        <div className="grid grid-cols-3 gap-4 min-h-0">
          <CartView
            className="col-span-2 bg-white/80 border-slate-200 h-full"
            items={state.items}
            onInc={(id) => changeQty(id, 1)}
            onDec={(id) => changeQty(id, -1)}
            onRemove={(id) => removeItem(id)}
          />
          <DiscountPanel
            className="col-span-1 bg-white/80 border-slate-200 h-full"
            discountAmount={state.discountAmount}
            taxPercent={state.taxPercent}
            onChangeDiscountAmount={(v) => setState({ discountAmount: Math.max(0, v) })}
            onChangeTaxPercent={(v) => setState({ taxPercent: Math.max(0, v) })}
          />
        </div>

        <div className="min-h-0">
          <InvoicePreview
            subTotal={subTotal}
            discountAmount={discountAmount}
            taxPercent={state.taxPercent}
            taxAmount={tax}
            total={total}
            onCreate={handleCreateInvoice}
          />
        </div>
      </div>
    </div>
  );
}
