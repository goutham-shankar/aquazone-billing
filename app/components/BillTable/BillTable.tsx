import React from 'react';
import { BillItem } from '../../types';

interface BillTableProps {
  items: BillItem[];
  onQuantityChange: (id: number, quantity: number) => void;
  onSpecialNoteChange: (id: number, note: string) => void;
  onRemoveItem: (id: number) => void;
  compact?: boolean; // Added compact prop
}

export default function BillTable({ 
  items, 
  onQuantityChange, 
  onSpecialNoteChange, 
  onRemoveItem,
  compact = false
}: BillTableProps) {
  if (compact) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
              <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Price</th>
              <th className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Amount</th>
              <th className="px-2 py-1 w-8"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-2 py-1 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-900">{item.name}</span>
                    {item.specialNote && (
                      <span className="text-xs text-gray-500 italic">Note: {item.specialNote}</span>
                    )}
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      className="h-5 w-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-l focus:outline-none"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="h-5 w-8 text-center border-t border-b border-gray-300 focus:outline-none text-xs"
                      min="1"
                    />
                    <button 
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                      className="h-5 w-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-r focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-right">₹{item.price.toFixed(2)}</td>
                <td className="px-2 py-1 whitespace-nowrap text-right font-medium">₹{item.amount.toFixed(2)}</td>
                <td className="px-2 py-1 whitespace-nowrap text-right">
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Original non-compact version
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <input
                    type="text"
                    value={item.specialNote}
                    onChange={(e) => onSpecialNoteChange(item.id, e.target.value)}
                    placeholder="Add special instructions"
                    className="mt-1 text-xs text-gray-500 border-b border-dashed border-gray-300 focus:outline-none focus:border-gray-500 w-full"
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center">
                  <button 
                    onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    className="h-8 w-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-l focus:outline-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="h-8 w-12 text-center border-t border-b border-gray-300 focus:outline-none"
                    min="1"
                  />
                  <button 
                    onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    className="h-8 w-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-r focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">₹{item.price.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right font-medium">₹{item.amount.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}