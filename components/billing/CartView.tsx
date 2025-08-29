"use client";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

interface CartViewProps {
  className?: string;
  items: CartItem[];
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function CartView({ className, items, onInc, onDec, onRemove }: CartViewProps) {
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className={`border rounded-lg p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Cart ({totalItems} items)
        </h3>
        <div className="text-sm text-slate-600">
          Subtotal: ₹{subtotal.toFixed(2)}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                  <div className="text-sm text-slate-600">
                    ₹{item.price} × {item.qty} = ₹{(item.price * item.qty).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={() => onDec(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  
                  <button
                    onClick={() => onInc(item.id)}
                    disabled={item.qty >= item.stock}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
                      item.qty >= item.stock
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Cart is empty</p>
            <p className="text-sm">Add products from the catalog</p>
          </div>
        )}
      </div>
    </div>
  );
}
