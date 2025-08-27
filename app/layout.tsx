import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/Authcontext';
import { Toaster } from 'react-hot-toast';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'IDCA POS System',
  description: 'Point of Sale System built with Next.js and Tailwind CSS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
  <body className={`dark bg-gray-900 text-gray-100 ${inter.className}`}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}