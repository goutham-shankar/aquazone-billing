"use client";
import React, { useEffect } from 'react';
import { FileText, Search as SearchIcon, Calculator } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface NavTabsProps { userName?: string; onSignOut?: () => void; }

export const NavTabs: React.FC<NavTabsProps> = ({ userName = 'User', onSignOut }) => {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(()=>{
    const handler = (e: KeyboardEvent) => {
      // NavTabs no longer hijacks Ctrl+K (reserved for Add Product dialog inside billing)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        // Do nothing here so billing page handler can catch it.
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [router]);
  const tab = (label: string, icon: React.ReactNode, path: string) => {
    const active = pathname.startsWith(path);
    return (
      <button onClick={() => router.push(path)} className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{icon}<span className="ml-2">{label}</span></button>
    );
  };
  return (
    <nav className="bg-white dark:bg-gray-900 shadow border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/billing')}>
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center"><Calculator className="h-5 w-5 text-white" /></div>
            <span className="hidden sm:block font-semibold text-gray-900 dark:text-white">Aquazone</span>
          </div>
          <div className="flex items-center gap-1">
            {tab('Billing', <FileText className="h-4 w-4" />, '/billing')}
            {tab('Search', <SearchIcon className="h-4 w-4" />, '/search')}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts'))} className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Keyboard Shortcuts</button>
          <button onClick={onSignOut} className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:ring-2 hover:ring-blue-500">{userName?.charAt(0)}</button>
        </div>
      </div>
    </nav>
  );
};

export default NavTabs;