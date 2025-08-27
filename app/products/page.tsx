"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Package, Search } from 'lucide-react';
import NavTabs from '../components/NavTabs';
import { getProducts } from '../lib/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const ProductsPage = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  useEffect(()=>{ const unsub = onAuthStateChanged(auth, u=>{ if(!u){ router.push('/login'); } else { setUserName(u.displayName|| u.email||'User'); load(); } }); return ()=>unsub(); },[router]);
  const load = async (term: string='') => { setLoading(true); try { const data = await getProducts({ search: term }); setProducts(data); } finally { setLoading(false); } };
  useEffect(()=>{ const id = setTimeout(()=> load(search), 400); return ()=> clearTimeout(id); },[search]);
  return (
    <div className={`h-screen flex flex-col bg-gray-900`}>
      <NavTabs userName={userName} />
      <div className="p-6 space-y-4 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-semibold flex items-center gap-2 text-blue-400"><Package className="h-6 w-6" />Products</h1>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center flex-1 relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products (name, SKU, category)" className="flex-1 pl-10 pr-3 py-2 border border-gray-600 rounded bg-gray-900 focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={viewMode} onChange={e=>setViewMode(e.target.value as any)} className="px-2 py-2 text-sm border border-gray-600 rounded bg-gray-900">
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          </div>
          {loading ? <p className="text-sm">Loading...</p> : products.length === 0 ? <p className="text-sm text-gray-400">No products</p> : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-4 gap-4">
                {products.map(p=> (
                  <div key={p._id || p.id} className="group border border-gray-700 rounded-lg p-4 bg-gray-900 hover:border-blue-600 transition-colors">
                    {p.image && <img src={p.image} alt={p.name} className="h-32 w-full object-cover rounded mb-3 bg-gray-800" />}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-sm leading-tight group-hover:text-blue-400">{p.name}</h3>
                      {p.stock !== undefined && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">{p.stock}</span>}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2 min-h-[30px]">{p.description || '—'}</p>
                    <div className="flex items-center justify-between text-sm font-bold text-blue-400">₹{p.price}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {products.map(p=> (
                  <div key={p._id || p.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {p.image && <img src={p.image} alt={p.name} className="h-12 w-12 object-cover rounded bg-gray-800" />}
                      <div>
                        <div className="font-medium text-sm">{p.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1">{p.description}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-blue-400">₹{p.price}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
