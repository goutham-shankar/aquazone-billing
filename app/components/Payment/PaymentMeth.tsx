import React from 'react';
import { PaymentMethod } from '../../types';

interface PaymentMethodsProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  compact?: boolean; // Added compact prop
}

export default function PaymentMethods({ 
  selectedMethod, 
  onMethodChange,
  compact = false 
}: PaymentMethodsProps) {
  const methods: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    {
      id: 'cash',
      label: 'Cash',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'card',
      label: 'Card',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'others',
      label: 'Others',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      )
    }
  ];

  if (compact) {
    return (
      <div className="flex flex-col space-y-1">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`flex items-center p-2 rounded-md text-xs transition-colors duration-200 ${
              selectedMethod === method.id
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <span className="mr-2">{method.icon}</span>
            {method.label}
          </button>
        ))}
      </div>
    );
  }

  // Original non-compact version
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => onMethodChange(method.id)}
          className={`flex items-center justify-center p-4 rounded-lg transition-colors duration-200 ${
            selectedMethod === method.id
              ? 'bg-blue-100 text-blue-800 font-medium border-2 border-blue-500'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
          }`}
        >
          <span className="mr-2">{method.icon}</span>
          {method.label}
        </button>
      ))}
    </div>
  );
}