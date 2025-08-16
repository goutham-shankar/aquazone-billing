'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface QuickSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (type: 'text' | 'barcode' | 'plu', term?: string) => void;
  placeholder?: string;
}

const QuickSearchInput: React.FC<QuickSearchInputProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...'
}) => {
  const [searchType, setSearchType] = useState<'text' | 'barcode' | 'plu'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchType, value);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="block w-full pl-10 pr-24 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
              placeholder={placeholder}
              autoComplete="off"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              <div className="border-l border-gray-200 h-6 mr-2"></div>
              <div className="mr-3 flex space-x-1">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('text');
                    if (value) onSearch('text', value);
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    searchType === 'text' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('barcode');
                    if (value) onSearch('barcode', value);
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    searchType === 'barcode' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Barcode
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('plu');
                    if (value) onSearch('plu', value);
                  }}
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    searchType === 'plu' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  PLU
                </button>
              </div>
            </div>
          </div>
          <motion.button
            type="submit"
            className="ml-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default QuickSearchInput;
