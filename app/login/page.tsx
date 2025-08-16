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
  const [imageError, setImageError] = useState(false);

  // Redirect to home if already logged in
  useEffect(() => {
    if (!loading && user) {
      setIsRedirecting(true);
      router.push('/');
    }
  }, [user, loading, router]);

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
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              <span className="text-xs text-center leading-tight">
                AQUA<br />ZONE
              </span>
            </div>
          </div>
          
          {/* Header */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Sign in to access the billing system
          </p>
          
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 text-sm"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </motion.div>
          )}
          
          {/* Google Sign In Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!imageError ? (
              <Image
                src="/google-logo.png"
                alt="Google"
                width={20}
                height={20}
                className="object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              // Fallback Google icon using SVG
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-gray-700 font-medium">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </span>
          </motion.button>
          
          {/* Alternative Sign In Button */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg px-4 py-3 flex items-center justify-center space-x-2 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiLogIn size={18} />
            <span className="font-medium">
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </motion.button>
          
          {/* Terms and Privacy */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              By continuing, you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 underline">
                terms of service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-500 underline">
                privacy policy
              </a>
              .
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}