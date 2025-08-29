"use client";
import { useState, useEffect, useMemo } from "react";
import { Search, Package, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  stock: number;
  image?: string;
  category: {
    _id: string;
    name: string;
  };
}

interface Category {
  _id: string;
  name: string;
}

interface ProductCatalogProps {
  className?: string;
  onAdd: (product: { id: string; name: string; price?: number; stock?: number }) => void;
  cartItems?: Array<{ id: string; qty: number }>;
}

export default function ProductCatalog({ className, onAdd, cartItems = [] }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [activeCategory, searchQuery]);

  const loadCategories = async () => {
    try {
      const response = await api.categories.list();
      if (response.success && response.data) {
        setCategories(response.data.items || []);
      } else {
        console.error("Failed to load categories:", (response as any).error);
        toast.error("Failed to load categories");
        setCategories([]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      if (activeCategory !== "all") {
        params.category = activeCategory;
      }

      const response = await api.products.list(params);
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      } else {
        console.error("Failed to load products:", (response as any).error);
        toast.error("Failed to load products");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getProductQuantityInCart = (productId: string) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.qty : 0;
  };

  const handleAddProduct = (product: Product) => {
    const qtyInCart = getProductQuantityInCart(product._id);
    
    if (product.stock <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    if (qtyInCart >= product.stock) {
      toast.error('Cannot add more items. All available stock is already in cart.');
      return;
    }
    
    const price = product.retailPrice || product.price || product.wholesalePrice || 0;
    onAdd({
      id: product._id,
      name: product.name,
      price: price,
      stock: product.stock
    });
  };

  const filteredProducts = useMemo(() => {
    return products; // Show all products, including out of stock ones
  }, [products]);

  return (
    <div className={`border rounded-lg p-4 flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Product Catalog
        </h3>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-4">
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
              activeCategory === "all"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => setActiveCategory(category._id)}
              className={`px-3 py-1.5 text-sm rounded whitespace-nowrap transition-colors ${
                activeCategory === category._id
                  ? "bg-sky-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const qtyInCart = getProductQuantityInCart(product._id);
              const price = product.retailPrice || product.price || product.wholesalePrice || 0;
              
              return (
                <div
                  key={product._id}
                  className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                >
                  {product.image && (
                    <div className="w-full h-24 bg-slate-100 rounded mb-2 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <h4 className="font-medium text-sm text-slate-800 mb-1 line-clamp-2">
                    {product.name}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <span>₹{price}</span>
                    <span className={product.stock <= 0 ? 'text-red-600 font-medium' : ''}>
                      {product.stock <= 0 ? 'OUT OF STOCK' : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddProduct(product)}
                      disabled={product.stock <= 0 || qtyInCart >= product.stock}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs transition-colors ${
                        product.stock <= 0 || qtyInCart >= product.stock
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      {product.stock <= 0 || qtyInCart >= product.stock ? 'OUT OF STOCK' : 'Add'}
                    </button>
                    {qtyInCart > 0 && (
                      <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                        {qtyInCart}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {searchQuery ? "No products found for your search" : "No products available"}
          </div>
        )}
      </div>
    </div>
  );
}
