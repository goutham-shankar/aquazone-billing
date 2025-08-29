"use client";
import { useState, useEffect } from "react";
import { Search, Package, Plus, Edit, Trash2, Eye, Filter, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  stock: number;
  category: {
    _id: string;
    name: string;
  };
  brand?: string;
  description?: string;
  image?: string;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      const response = await api.categories.list();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50, sortBy, sortOrder };
      if (searchQuery.trim()) {
        params.search = searchQuery;
      }
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await api.products.list(params);
      if (response.success) {
        //@ts-ignore
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  const getDisplayPrice = (product: Product) => {
    return product.retailPrice || product.price || product.wholesalePrice || 0;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name, brand..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("_");
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}
            className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="price_asc">Price Low-High</option>
            <option value="price_desc">Price High-Low</option>
            <option value="stock_asc">Stock Low-High</option>
            <option value="stock_desc">Stock High-Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading products...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {product.image && (
                  <div className="h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1">
                      {product.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      product.stock > 10 
                        ? "bg-green-100 text-green-800" 
                        : product.stock > 0 
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <div className="text-lg font-bold text-slate-900">
                      ₹{getDisplayPrice(product).toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-600">
                      {product.category.name}
                      {product.brand && ` • ${product.brand}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => viewProductDetails(product)}
                      className="flex-1 py-2 text-sm bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            {searchQuery ? "No products found for your search" : "No products available"}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {showDetails && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Product Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 hover:bg-slate-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedProduct.image && (
                  <div className="h-64 bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                    <div className="text-slate-900 font-semibold">{selectedProduct.name}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <div className="text-slate-900">{selectedProduct.category.name}</div>
                  </div>

                  {selectedProduct.brand && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                      <div className="text-slate-900">{selectedProduct.brand}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
                      <div className="text-slate-900 font-semibold">₹{getDisplayPrice(selectedProduct).toFixed(2)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                      <div className="text-slate-900">{selectedProduct.stock} units</div>
                    </div>
                  </div>

                  {selectedProduct.description && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                      <div className="text-slate-900">{selectedProduct.description}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
                Edit Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
