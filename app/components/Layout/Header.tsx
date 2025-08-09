'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/Authcontext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiLogOut, FiSettings, FiMenu, FiPrinter, FiHelpCircle } from 'react-icons/fi';
import Link from 'next/link';

interface HeaderProps {
  toggleMenu?: () => void;
  toggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu }) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white p-2 shadow-sm flex justify-between items-center">
      <div className="flex items-center">
        {toggleMenu && (
          <button 
            onClick={toggleMenu} 
            className="p-2 mr-2 lg:hidden hover:bg-gray-100 rounded-md"
          >
            <FiMenu className="h-6 w-6 text-gray-600" />
          </button>
        )}
        <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-white font-bold">
          <span className="text-xs">AQUA<br/>ZONE</span>
        </div>
        <h1 className="ml-4 text-xl font-semibold">Generate Bill</h1>
      </div>
      <div className="flex space-x-4 items-center">
        {/* Header Icons */}
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <FiPrinter className="h-5 w-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <FiSettings className="h-5 w-5 text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <FiHelpCircle className="h-5 w-5 text-gray-600" />
        </button>
        
        <div className="bg-gray-100 rounded-md p-2 text-sm hidden md:block">
          <div>Call For Support</div>
          <div className="font-bold">07969 223344</div>
        </div>

        {/* User profile dropdown */}
        <div className="relative" ref={userMenuRef}>
          {loading ? (
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>
          ) : user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 border rounded-full p-1 hover:bg-gray-50"
              >
                {user.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = '/user-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full">
                    <FiUser className="h-5 w-5" />
                  </div>
                )}
                <span className="text-sm font-medium pr-2 hidden md:block">
                  {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiUser className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiSettings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link 
              href="/login"
              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <FiLogOut className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;