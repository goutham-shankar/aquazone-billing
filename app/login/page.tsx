'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/Authcontext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiLogIn } from 'react-icons/fi';

export default function LoginPage() {
  const { user, signInWithGoogle, loading, error } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to home if already logged in
  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      router.push('/');
    }
  }, [user, loading, router]);

  // Clear any auth errors when component mounts
  
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // Auth context will handle the redirect after successful login
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  if (loading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-600">{isRedirecting ? 'Redirecting...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              <span className="text-sm">AQUA<br />ZONE</span>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-center text-gray-600 mb-8">Sign in to access the billing system</p>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          
          <button
            onClick={handleLogin}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-4"
          >
            <Image 
              src="/google-logo.png" 
              alt="Google" 
              width={20} 
              height={20} 
              className="object-contain"
              onError={(e) => {
                // Fallback if image not found
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-gray-700 font-medium">Sign in with Google</span>
          </button>
          
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-indigo-600 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <FiLogIn size={18} />
            <span className="font-medium">Sign In</span>
          </motion.button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>By continuing, you agree to our terms of service and privacy policy.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
