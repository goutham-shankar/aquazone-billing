'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/Authcontext';
import { Product, Category } from '../types';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://x2zlcvi4af.execute-api.ap-south-1.amazonaws.com/dev';

interface ApiProductResponse {
  _id: string;
  id?: string;
  name: string;
  category: {
    _id?: string;
    name?: string;
    description?: string;
  } | string;
  price: number;
  image?: string;
  description?: string;
  inStock?: boolean;
  sku?: string;
  subCategory?: string;
  stock?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  brand?: string;
  remarks?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getIdToken } = useAuth();

  // Helper function to transform product data from API response
  const transformProductData = (product: ApiProductResponse): Product => ({
    _id: product._id,
    id: product._id || product.id, // Support both formats
    name: product.name,
    category: typeof product.category === 'object' ? 
      {
        _id: product.category._id || '',
        name: product.category.name || '',
        description: product.category.description || ''
      } : 
      {
        _id: '',
        name: typeof product.category === 'string' ? product.category : '',
        description: ''
      },
    subCategory: product.subCategory || '',
    stock: product.stock || 0,
    price: product.price || 0,
    wholesalePrice: product.wholesalePrice || 0,
    retailPrice: product.retailPrice || 0,
    brand: product.brand || '',
    remarks: product.remarks || '',
    description: product.description || '',
    image: product.image || '',
    imageUrl: product.imageUrl || product.image || '', // Support both formats
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });

  // Helper function to prepare product data for API
  const prepareProductForAPI = (productData: Partial<Product>) => {
    // Create a copy to avoid mutating the original object
    const prepared = { ...productData };
    
    // Handle the category field specifically
    if (prepared.category) {
      if (typeof prepared.category === 'object' && prepared.category._id) {
        // If category is an object with an _id, just use the _id
        prepared.category = prepared.category._id;
      } else if (typeof prepared.category === 'string') {
        // If category is a string but not an ObjectId, try to find matching category
        if (!/^[0-9a-fA-F]{24}$/.test(prepared.category)) {
          // This is the case where a category name is being passed
          const matchingCategory = categories.find(c => c.name === prepared.category);
          if (matchingCategory) {
            prepared.category = matchingCategory._id;
          } else {
            // This is critical - if we don't have a match, we need to let the user know
            throw new Error(`Category "${prepared.category}" not found. Please select a valid category.`);
          }
        }
        // If it's already an ObjectId string, no change needed
      }
    }
    
    // Ensure price fields are numbers
    if (prepared.price !== undefined) prepared.price = Number(prepared.price);
    if (prepared.wholesalePrice !== undefined) prepared.wholesalePrice = Number(prepared.wholesalePrice);
    if (prepared.retailPrice !== undefined) prepared.retailPrice = Number(prepared.retailPrice);
    if (prepared.stock !== undefined) prepared.stock = Number(prepared.stock);
    
    return prepared;
  };

  // Fetch categories for reference
  const fetchCategories = async () => {
    try {
      if (!user) return;
      
      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/category`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }
      
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else if (Array.isArray(data)) {
        // Handle old API format
        setCategories(data);
      } else {
        console.error('Unexpected API response format for categories:', data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        setIsLoading(false);
        return;
      }

      // First make sure we have categories loaded
      await fetchCategories();

      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      // Handle different API response formats
      if (data.success && Array.isArray(data.data)) {
        // New API format with success and data properties
        const transformedProducts = data.data.map(transformProductData);
        setProducts(transformedProducts);
        toast.success(`Loaded ${transformedProducts.length} products`);
      } else if (Array.isArray(data)) {
        // Old API format returning directly an array
        const transformedProducts = data.map(transformProductData);
        setProducts(transformedProducts);
        toast.success(`Loaded ${transformedProducts.length} products`);
      } else {
        console.error('Unexpected API response format for products:', data);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      toast.error("Failed to fetch products");
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      if (!user) return;

      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      
      // Make sure we have categories loaded for reference
      if (categories.length === 0) {
        await fetchCategories();
      }
      
      // Prepare data for submission
      const preparedData = prepareProductForAPI(productData);
      
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(preparedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to create product');
      }

      // Handle different API response formats
      if (data.success && data.data) {
        // New API format
        const newProduct = transformProductData(data.data);
        setProducts(prevProducts => [...prevProducts, newProduct]);
        toast.success(`Created product: ${newProduct.name}`);
        return newProduct;
      } else {
        // Old API format or other format
        const newProduct = transformProductData(data);
        setProducts(prevProducts => [...prevProducts, newProduct]);
        toast.success(`Created product: ${newProduct.name}`);
        return newProduct;
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
      toast.error(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      setError(null);
      if (!user) return;

      // Make sure categories are loaded before updating
      if (categories.length === 0) {
        await fetchCategories();
      }
      
      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      
      // Prepare data for submission, handling the category properly
      const preparedData = prepareProductForAPI(productData);
      
      // Use _id if available, otherwise use id
      const productId = id.startsWith('_') ? id.substring(1) : id;
      
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(preparedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to update product');
      }

      // Handle different API response formats
      if (data.success && data.data) {
        // New API format
        const updatedProduct = transformProductData(data.data);
        
        setProducts(prevProducts =>
          prevProducts.map(product =>
            (product._id === id || product.id === id) ? updatedProduct : product
          )
        );
        toast.success(`Updated product: ${updatedProduct.name}`);
        return updatedProduct;
      } else {
        // Old API format or other format
        const updatedProduct = transformProductData(data);
        
        setProducts(prevProducts =>
          prevProducts.map(product =>
            (product._id === id || product.id === id) ? updatedProduct : product
          )
        );
        toast.success(`Updated product: ${updatedProduct.name}`);
        return updatedProduct;
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
      toast.error(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      setError(null);
      if (!user) return;

      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return;
      }
      
      // Use _id if available, otherwise use id
      const productId = id.startsWith('_') ? id.substring(1) : id;
      
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product');
      }

      if (data.success || data.acknowledged) {
        setProducts(prevProducts =>
          prevProducts.filter(product => product._id !== id && product.id !== id)
        );
        toast.success("Product deleted successfully");
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      toast.error(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  };

  // Get a single product by ID
  const getProductById = async (id: string) => {
    try {
      setError(null);
      if (!user) return null;
      
      // Check if product exists in local state first
      const cachedProduct = products.find(product => 
        product._id === id || product.id === id
      );
      if (cachedProduct) return cachedProduct;
      
      // If not found locally, fetch from API
      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return null;
      }
      
      // Use _id if available, otherwise use id
      const productId = id.startsWith('_') ? id.substring(1) : id;
      
      const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch product with ID: ${id}`);
      }

      // Handle different API response formats
      if (data.success && data.data) {
        // New API format
        const product = transformProductData(data.data);
        return product;
      } else {
        // Old API format or other format
        const product = transformProductData(data);
        return product;
      }
    } catch (err) {
      console.error(`Error fetching product with ID ${id}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch product with ID: ${id}`);
      throw err;
    }
  };

  // Get products by category ID
  const getProductsByCategory = async (categoryId: string) => {
    try {
      setError(null);
      if (!user) return [];
      
      // First check if we can filter from local state
      if (products.length > 0) {
        const filteredProducts = products.filter(
          product => 
            (typeof product.category === 'object' && 
             (product.category._id === categoryId || product.category.name === categoryId)) || 
            (typeof product.category === 'string' && product.category === categoryId)
        );
        
        // If we have products with this category locally, return them
        if (filteredProducts.length > 0) {
          return filteredProducts;
        }
      }
      
      // Otherwise fetch from API
      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/product/category/${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch products for category: ${categoryId}`);
      }

      // Handle different API response formats
      if (data.success && Array.isArray(data.data)) {
        // New API format
        const categoryProducts = data.data.map(transformProductData);
        return categoryProducts;
      } else if (Array.isArray(data)) {
        // Old API format
        const categoryProducts = data.map(transformProductData);
        return categoryProducts;
      }
      return [];
    } catch (err) {
      console.error(`Error fetching products for category ${categoryId}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch products for category: ${categoryId}`);
      toast.error(err instanceof Error ? err.message : "Failed to fetch products for category");
      throw err;
    }
  };

  // Search products by name or description
  const searchProducts = async (query: string) => {
    try {
      setError(null);
      if (!user || !query.trim()) return [];
      
      // First try searching locally
      if (products.length > 0) {
        const lowerCaseQuery = query.toLowerCase();
        const localResults = products.filter(
          product => 
            product.name.toLowerCase().includes(lowerCaseQuery) ||
            (product.description && product.description.toLowerCase().includes(lowerCaseQuery))
        );
        
        // If we have local results, return them
        if (localResults.length > 0) {
          return localResults;
        }
      }
      
      // Otherwise search via API
      let idToken;
      try {
        idToken = await getIdToken();
      } catch (tokenError) {
        console.error('Error getting auth token:', tokenError);
        toast.error("Authentication failed. Please log in again.");
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/product/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search products');
      }

      // Handle different API response formats
      if (data.success && Array.isArray(data.data)) {
        // New API format
        const searchResults = data.data.map(transformProductData);
        return searchResults;
      } else if (Array.isArray(data)) {
        // Old API format
        const searchResults = data.map(transformProductData);
        return searchResults;
      }
      
      return [];
    } catch (err) {
      console.error('Error searching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to search products');
      toast.error("Failed to search products");
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setProducts,
    categories,
    getProductById,
    getProductsByCategory,
    searchProducts,
  };
};

export default useProducts;
