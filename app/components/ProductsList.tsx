'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiPlus } from 'react-icons/fi'

interface Product {
  id: string
  name: string
  price: number
  description: string
  category: string
}

// Sample products data - consider moving this to a separate file or fetching from an API
const products: Product[] = [
  {
    id: 'P001',
    name: 'Premium Web Hosting',
    price: 29.99,
    description: 'High-performance web hosting with 99.9% uptime',
    category: 'Hosting'
  },
  {
    id: 'P002',
    name: 'Domain Registration',
    price: 12.99,
    description: 'Register your domain name for one year',
    category: 'Domain'
  },
  {
    id: 'P003',
    name: 'SSL Certificate',
    price: 49.99,
    description: 'Secure your website with SSL encryption',
    category: 'Security'
  },
  {
    id: 'P004',
    name: 'Email Hosting',
    price: 19.99,
    description: 'Professional email hosting service',
    category: 'Email'
  },
  {
    id: 'P005',
    name: 'VPS Hosting',
    price: 59.99,
    description: 'Virtual Private Server with root access',
    category: 'Hosting'
  }
]

interface ProductsListProps {
  onAddToInvoice: (product: Product) => void
}

export default function ProductsList({ onAddToInvoice }: ProductsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // No results message to display when no products match the search
  const noResultsMessage = (
    <div className="col-span-full flex justify-center items-center py-8">
      <p className="text-gray-500 dark:text-gray-400">No products match your search criteria</p>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
    >
      {/* Search bar */}
      <div className="flex items-center mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                     focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400
                     transition-all duration-200"
          />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500" size={20} />
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <span className="px-2 py-1 text-sm rounded-full bg-indigo-100 dark:bg-indigo-900 
                             text-indigo-800 dark:text-indigo-200">
                  {product.category}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {product.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ₹{product.price.toFixed(2)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAddToInvoice(product)}
                  className="flex items-center px-3 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700
                           dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white transition-colors duration-200"
                  aria-label={`Add ${product.name} to invoice`}
                >
                  <FiPlus className="mr-1" />
                  Add to Invoice
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          noResultsMessage
        )}
      </div>
    </motion.div>
  )
}