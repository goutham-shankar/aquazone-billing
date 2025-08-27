"use client";
// Minimal root redirect page. Legacy billing UI moved to /billing/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/billing'); }, [router]);
  return null;
}