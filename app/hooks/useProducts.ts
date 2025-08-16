"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../context/Authcontext';

export interface Product {
  _id?: string;
  name: string;
  category: string | { _id: string; name: string; description?: string };
  subCategory: string;
  stock: number;
  brand: string;
  price?: number; 
  wholesalePrice: number; // New field for wholesale pricing
  retailPrice: number; // New field for retail pricing
  remarks?: string;
  description: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // API base URL from environment variable
  const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/product`;
  
  // Helper function to extract category name
    const getCategoryName = (category: string | { _id: string; name: string; description?: string }): string => {
      if (typeof category === 'string') return category;
      if (category && typeof category === 'object' && 'name' in category) return category.name;
      return '';
    };
  
  // Helper function to extract category ID
  // Removed getCategoryId and transformProductData (unused)

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const idToken = await user.getIdToken();
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch products');
      }
      
      if (data.success) {
        // Transform API response to match our interface
        const transformedProducts = data.data.map((product: Product) => ({
          _id: product._id,
          name: product.name,
          category: getCategoryName(product.category),
          subCategory: product.subCategory || '',
          stock: product.stock || 0,
          brand: product.brand || '',
          price: product.price || 0,
          wholesalePrice: product.wholesalePrice || 0,
          retailPrice: product.retailPrice || 0,
          remarks: product.remarks || '',
          description: product.description || '',
          image: product.image || '',
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }));
        setProducts(transformedProducts);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new product
  const createProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      if (!user) return;
      
      const idToken = await user.getIdToken();
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(productData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to create product');
      }
      
      if (data.success) {
        // Transform and add the new product to state
        const newProduct = {
          _id: data.data._id,
          name: data.data.name,
          category: getCategoryName(data.data.category),
          subCategory: data.data.subCategory || '',
          stock: data.data.stock || 0,
          brand: data.data.brand || '',
          price: data.data.price || 0,
          wholesalePrice: data.data.wholesalePrice || 0,
          retailPrice: data.data.retailPrice || 0,
          remarks: data.data.remarks || '',
          description: data.data.description || '',
          image: data.data.image || '',
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt
        };
        
        setProducts(prevProducts => [...prevProducts, newProduct]);
        return newProduct;
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  // Update an existing product
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setError(null);
      if (!user) return;
      
      // Make sure the category is sent as an ID if it's an object
      const dataToUpdate: Partial<Product> = { ...productData };
      if (typeof dataToUpdate.category === 'object' && dataToUpdate.category !== null) {
        dataToUpdate.category = (dataToUpdate.category as { _id: string })._id;
      }
      
      const idToken = await user.getIdToken();
      
      // Use product ID in URL path for the update
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(dataToUpdate), // No need to include ID in body since it's in the URL
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to update product');
      }
      
      if (data.success) {
        // Transform and update the product in state
        const updatedProduct = {
          _id: data.data._id,
          name: data.data.name,
          category: getCategoryName(data.data.category),
          subCategory: data.data.subCategory || '',
          stock: data.data.stock || 0,
          brand: data.data.brand || '',
          price: data.data.price || 0,
          wholesalePrice: data.data.wholesalePrice || 0,
          retailPrice: data.data.retailPrice || 0,
          remarks: data.data.remarks || '',
          description: data.data.description || '',
          image: data.data.image || '',
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt
        };
        
        setProducts(prevProducts =>
          prevProducts.map(product =>
            product._id === id ? updatedProduct : product
          )
        );
        return updatedProduct;
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      if (!user) return;
      
      const idToken = await user.getIdToken();
      
      // Use product ID in URL path for deletion
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${idToken}`,
          // No Content-Type header needed for DELETE without body
        },
        // No body needed since we're using ID in the URL path
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to delete product');
      }
      
      if (data.success) {
        setProducts(prevProducts =>
          prevProducts.filter(product => product._id !== id)
        );
        return true;
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  // Load products on component mount and when user changes
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setProducts,
  };
};