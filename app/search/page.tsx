"use client";
import React, { useState, useEffect, useCallback } from 'react';
import NavTabs from '../components/NavTabs';
import { Search, Package, Users, X, SlidersHorizontal } from 'lucide-react';
import ImageFallback from '../components/ImageFallback';
import { getProducts, searchCustomers } from '../lib/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const SearchPage = () => {
  const [mode, setMode] = useState<'products'|'customers'>('products');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(()=>{ const unsub = onAuthStateChanged(auth, u=>{ if(!u){ router.push('/login'); } else { setUserName(u.displayName||u.email||'User'); } }); return ()=>unsub(); },[router]);

  useEffect(()=>{ const id = setTimeout(()=>{ performSearch(); }, 350); return ()=> clearTimeout(id); },[query, mode, priceMin, priceMax, city]);

  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        const el = document.getElementById('global-search-input');
        el?.focus();
      }
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const performSearch = async () => {
    setLoading(true);
    try {
      if(mode==='products') {
        const data = await getProducts({ search: query });
        setResults(data);
        setTotal(data.length);
      } else {
        const data = await searchCustomers({ q: query });
        let filtered = data;
        if (city.trim()) filtered = filtered.filter((c:any)=> (c.address?.city||'').toLowerCase().includes(city.toLowerCase()));
        setResults(filtered);
        setTotal(filtered.length);
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-gray-100">
      <NavTabs userName={userName} />
      <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center gap-6 sticky top-0 z-10 pb-4 bg-gray-900">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Search className="h-6 w-6 text-blue-400" />Search</h1>
          <div className="flex gap-2 text-sm">
            <button onClick={()=>{setMode('products'); setSelected(null);}} className={`px-4 py-2 rounded border ${mode==='products'?'border-blue-500 bg-blue-600 text-white':'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>Products</button>
            <button onClick={()=>{setMode('customers'); setSelected(null);}} className={`px-4 py-2 rounded border ${mode==='customers'?'border-blue-500 bg-blue-600 text-white':'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>Customers</button>
          </div>
          <div className="flex items-center flex-1 relative max-w-2xl">
            <Search className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input id="global-search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Type to search ${mode} ( / to focus )`} className="flex-1 pl-10 pr-10 py-2 border border-gray-700 rounded bg-gray-900 focus:ring-2 focus:ring-blue-600" />
            {query && <button onClick={()=>setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>}
          </div>
          <button onClick={()=>setShowFilters(s=>!s)} className={`flex items-center gap-1 px-3 py-2 text-sm rounded border ${showFilters? 'border-blue-500 bg-blue-600 text-white':'border-gray-700 bg-gray-800 hover:border-gray-600'}`}><SlidersHorizontal className="h-4 w-4" />Filters</button>
          <div className="text-xs text-gray-400 ml-auto pr-2">{loading ? 'Searching…' : `${total} result${total===1?'':'s'}`}</div>
        </div>
        {showFilters && (
          <div className="grid grid-cols-6 gap-4 bg-gray-800 border border-gray-700 rounded-lg p-4 animate-fadeIn">
            {mode==='products' ? (
              <>
                <div>
                  <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Min Price</label>
                  <input value={priceMin} onChange={e=>setPriceMin(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-900" />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">Max Price</label>
                  <input value={priceMax} onChange={e=>setPriceMax(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-900" />
                </div>
              </>
            ) : (
              <div className="col-span-2">
                <label className="block text-[11px] uppercase tracking-wide text-gray-400 mb-1">City</label>
                <input value={city} onChange={e=>setCity(e.target.value)} className="w-full px-2 py-1 text-sm border border-gray-600 rounded bg-gray-900" />
              </div>
            )}
            <div className="col-span-1 flex items-end">
              <button onClick={()=>{ setPriceMin(''); setPriceMax(''); setCity(''); }} className="text-xs px-3 py-1 rounded border border-gray-600 hover:border-gray-500">Reset</button>
            </div>
          </div>
        )}
        <div className="flex-1 flex gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-4">
            {loading ? <p className="text-sm">Searching...</p> : results.length===0 ? <p className="text-sm text-gray-400">No results</p> : (
              <div className={mode==='products' ? 'grid grid-cols-5 gap-4' : 'divide-y divide-gray-700'}>
        {mode==='products' && results.filter((p:any)=>{
                  const minOk = priceMin? Number(p.price)>=Number(priceMin): true;
                  const maxOk = priceMax? Number(p.price)<=Number(priceMax): true;
                  return minOk && maxOk;
                }).map((p:any)=>(
                  <div key={p._id || p.id} onClick={()=>setSelected(p)} className={`border ${selected?._id===p._id?'border-blue-500':'border-gray-700'} rounded-lg p-3 bg-gray-900 hover:border-blue-600 cursor-pointer transition-colors`}>
          <ImageFallback src={p.image} alt={p.name} className="h-32 w-full mb-2" />
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-xs leading-tight pr-2 line-clamp-2">{p.name}</h3>
                      {p.stock!==undefined && <span className="text-[10px] px-1 bg-gray-800 rounded text-gray-400">{p.stock}</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 min-h-[28px]">{p.description || '—'}</p>
                    <div className="text-xs font-bold text-blue-400">₹{p.price}</div>
                  </div>
                ))}
                {mode==='customers' && results.map((c:any)=>(
                  <div key={c._id || c.id} onClick={()=>setSelected(c)} className={`py-3 flex items-center justify-between cursor-pointer px-1 ${selected?._id===c._id?'bg-gray-700/60':''} hover:bg-gray-700/40 rounded` }>
                    <div className="min-w-0 pr-4">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.phone}</p>
                    </div>
                    {c.address?.city && <span className="text-[10px] px-2 py-1 bg-gray-900 rounded text-gray-300">{c.address.city}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="w-80 flex-shrink-0 bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-y-auto" hidden={!selected}>
            {selected && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-sm font-semibold text-blue-400">Details</h2>
                  <button onClick={()=>setSelected(null)} className="text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
                </div>
                {mode==='products' ? (
                  <div className="space-y-3 text-xs">
                    {selected.image && <img src={selected.image} alt={selected.name} className="w-full h-40 object-cover rounded bg-gray-900" />}
                    <div>
                      <p className="font-semibold text-sm mb-1">{selected.name}</p>
                      <p className="text-gray-400 leading-relaxed whitespace-pre-line">{selected.description || 'No description'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-900 rounded p-2"><p className="text-[10px] uppercase text-gray-500">Price</p><p className="font-medium">₹{selected.price}</p></div>
                      <div className="bg-gray-900 rounded p-2"><p className="text-[10px] uppercase text-gray-500">Stock</p><p className="font-medium">{selected.stock}</p></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm mb-1">{selected.name}</p>
                      <p className="text-gray-400">Phone: {selected.phone}</p>
                      {selected.email && <p className="text-gray-400">Email: {selected.email}</p>}
                      {selected.address?.city && <p className="text-gray-400">City: {selected.address.city}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
