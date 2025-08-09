// Consistent color scheme for the entire application
// Based on Indian market preferences with professional appearance

export const colors = {
  // Primary colors (Blue theme)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary colors (Gray theme)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Success colors (Green theme)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Main success color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning colors (Yellow/Orange theme)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error colors (Red theme)
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Main error color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Currency specific colors
  currency: {
    positive: '#16a34a', // Green for positive amounts
    negative: '#dc2626', // Red for negative amounts
    neutral: '#6b7280',  // Gray for neutral amounts
  },
  
  // Indian market specific colors
  indian: {
    saffron: '#ff9933',
    green: '#138808',
    navy: '#000080',
    gold: '#ffd700',
  }
};

// Common color combinations for specific use cases
export const colorCombinations = {
  primary: `bg-blue-600 text-white hover:bg-blue-700 border-blue-600`,
  primaryOutline: `border-blue-600 text-blue-600 hover:bg-blue-50`,
  success: `bg-green-600 text-white hover:bg-green-700 border-green-600`,
  successOutline: `border-green-600 text-green-600 hover:bg-green-50`,
  warning: `bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600`,
  warningOutline: `border-yellow-600 text-yellow-600 hover:bg-yellow-50`,
  error: `bg-red-600 text-white hover:bg-red-700 border-red-600`,
  errorOutline: `border-red-600 text-red-600 hover:bg-red-50`,
  neutral: `bg-gray-600 text-white hover:bg-gray-700 border-gray-600`,
  neutralOutline: `border-gray-600 text-gray-600 hover:bg-gray-50`,
};

export default colors;
