import React from 'react';
import { OrderType } from '../../types';

interface OrderTypeSelectorProps {
  selectedType: OrderType;
  onTypeChange: (type: OrderType) => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="flex space-x-4 mb-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="orderType"
          className="sr-only"
          checked={selectedType === 'delivery'}
          onChange={() => onTypeChange('delivery')}
        />
        <span className={`flex items-center px-3 py-2 rounded-md ${selectedType === 'delivery' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
          Delivery
        </span>
      </label>
      
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="orderType"
          className="sr-only"
          checked={selectedType === 'pickup'}
          onChange={() => onTypeChange('pickup')}
        />
        <span className={`flex items-center px-3 py-2 rounded-md ${selectedType === 'pickup' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Pick Up
        </span>
      </label>
      
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          name="orderType"
          className="sr-only"
          checked={selectedType === 'dinein'}
          onChange={() => onTypeChange('dinein')}
        />
        <span className={`flex items-center px-3 py-2 rounded-md ${selectedType === 'dinein' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Dine In
        </span>
      </label>
    </div>
  );
};

export default OrderTypeSelector;