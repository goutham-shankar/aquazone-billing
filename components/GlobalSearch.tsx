"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, User, Package, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    customers: any[];
    products: any[];
    invoices: any[];
  }>({ customers: [], products: [], invoices: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery("");
      setResults({ customers: [], products: [], invoices: [] });
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ customers: [], products: [], invoices: [] });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const [customers, products, invoices] = await Promise.all([
          api.customers.search({ q: query, limit: 5 }),
          api.products.list({ search: query, limit: 5 }),
          api.invoices.list({ limit: 5 })
        ]);

        setResults({
          customers: customers.success && customers.data ? customers.data.items || [] : [],
          products: products.success && products.data ? products.data.items || [] : [],
          invoices: invoices.success && invoices.data ? invoices.data.items || [] : []
        });
      } catch (error) {
        console.error("Search error:", error);
        setResults({ customers: [], products: [], invoices: [] });
        // Don't show error toast for search as it's not critical
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handlePick = (kind: string, item: any) => {
    window.dispatchEvent(new CustomEvent("global-search-pick", { detail: { kind, item } }));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search customers, products, invoices..."
            className="flex-1 outline-none text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
          />
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-gray-500">Searching...</div>
          )}

          {!loading && query && (
            <>
              {results.customers.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Customers</h3>
                  {results.customers.map((customer) => (
                    <button
                      key={customer._id}
                      onClick={() => handlePick("customer", customer)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                    >
                      <User className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          {customer.phone} • {customer.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.products.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Products</h3>
                  {results.products.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handlePick("product", product)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                    >
                      <Package className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          ₹{product.retailPrice || product.price} • Stock: {product.stock}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.invoices.length > 0 && (
                <div className="p-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-2 px-2">Invoices</h3>
                  {results.invoices.map((invoice) => (
                    <button
                      key={invoice._id}
                      onClick={() => handlePick("invoice", invoice)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-left"
                    >
                      <FileText className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="font-medium">Invoice #{invoice._id.slice(-6)}</div>
                        <div className="text-sm text-gray-500">
                          ₹{invoice.amount?.total} • {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.customers.length === 0 && results.products.length === 0 && results.invoices.length === 0 && (
                <div className="p-4 text-center text-gray-500">No results found</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
