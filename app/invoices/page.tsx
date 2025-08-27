"use client";
import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import NavTabs from '../components/NavTabs';
import { listInvoices } from '../lib/api';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const RecentInvoicesPage = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  useEffect(()=>{ const unsub = onAuthStateChanged(auth, async u=>{ if(!u){ router.push('/login'); } else { setUserName(u.displayName||u.email||'User'); await load(); } }); return ()=>unsub(); },[router]);
  const load = async () => { setLoading(true); try { const data = await listInvoices({}); setInvoices(Array.isArray(data)? data : data?.invoices || []); } finally { setLoading(false); } };
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <NavTabs userName={userName} />
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold flex items-center gap-2"><FileText className="h-6 w-6 text-blue-600" />Recent Invoices</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border dark:border-gray-700">
          {loading ? <p className="text-sm">Loading...</p> : invoices.length === 0 ? <p className="text-sm text-gray-500">No invoices</p> : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {invoices.map(inv => (
                <div key={inv._id || inv.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{inv.invoiceNumber || inv._id}</div>
                    <div className="text-xs text-gray-500">{inv.customer?.name}</div>
                  </div>
                  <div className="text-xs text-gray-600">{new Date(inv.createdAt || inv.date || Date.now()).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentInvoicesPage;
