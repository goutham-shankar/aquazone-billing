'use client';

import { useState, useEffect, useCallback } from 'react';

// Hook for barcode scanning functionality
export function useBarcodeScanner() {
  const [barcode, setBarcode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Timeout between scans (to avoid double scans)
  const scanTimeout = 800; // ms

  // Handle barcode input - typically barcode scanners work as keyboard input
  const handleBarcodeInput = useCallback((event: KeyboardEvent) => {
    // Ignore if input is focused
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && (
      activeElement.tagName === 'INPUT' || 
      activeElement.tagName === 'TEXTAREA' || 
      activeElement.isContentEditable
    )) {
      return;
    }

    // Only accept digits, letters, and some special chars common in barcodes
    if (/^[a-zA-Z0-9-_.\/+]$/.test(event.key)) {
      setBarcode(prev => prev + event.key);
      setIsScanning(true);
    } else if (event.key === 'Enter' && barcode.length > 3) {
      // Enter typically signals end of barcode scan
      setLastScanned(barcode);
      setBarcode('');
      setIsScanning(false);
    }
  }, [barcode]);

  // Clear barcode if no activity after timeout
  useEffect(() => {
    if (!isScanning) return;
    
    const timer = setTimeout(() => {
      setBarcode('');
      setIsScanning(false);
    }, scanTimeout);
    
    return () => clearTimeout(timer);
  }, [barcode, isScanning]);

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleBarcodeInput);
    return () => window.removeEventListener('keydown', handleBarcodeInput);
  }, [handleBarcodeInput]);

  return {
    barcode,
    isScanning,
    lastScanned,
    resetScanner: () => {
      setBarcode('');
      setLastScanned(null);
      setIsScanning(false);
    }
  };
}
