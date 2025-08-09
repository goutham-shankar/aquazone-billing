// Shared CSS class utilities for consistent UI across the application

export const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
  success: "bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
  danger: "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  warning: "bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
  
  // Compact versions
  primaryCompact: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500",
  secondaryCompact: "bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-1 px-2 rounded text-xs transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-gray-500",
  successCompact: "bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-green-500",
  dangerCompact: "bg-red-600 hover:bg-red-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-red-500",
};

export const inputStyles = {
  base: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200",
  compact: "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200",
  error: "border-red-300 focus:ring-red-500 focus:border-red-500",
  success: "border-green-300 focus:ring-green-500 focus:border-green-500",
};

export const cardStyles = {
  base: "bg-white rounded-lg shadow-sm border border-gray-200",
  compact: "bg-white rounded border border-gray-200",
  hover: "hover:shadow-md transition-shadow duration-200",
  interactive: "cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200",
};

export const textStyles = {
  heading: "text-lg font-semibold text-gray-900",
  headingCompact: "text-sm font-semibold text-gray-900",
  subheading: "text-md font-medium text-gray-700",
  subheadingCompact: "text-xs font-medium text-gray-700",
  body: "text-sm text-gray-600",
  bodyCompact: "text-xs text-gray-600",
  muted: "text-xs text-gray-500",
  mutedCompact: "text-xs text-gray-400",
};

export const spacingStyles = {
  padding: "p-4",
  paddingCompact: "p-2",
  margin: "m-4",
  marginCompact: "m-2",
  gap: "gap-4",
  gapCompact: "gap-2",
};

export const colorStyles = {
  primary: "text-blue-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  danger: "text-red-600",
  warning: "text-yellow-600",
  muted: "text-gray-500",
  
  // Background variants
  primaryBg: "bg-blue-50 text-blue-700 border-blue-200",
  successBg: "bg-green-50 text-green-700 border-green-200",
  dangerBg: "bg-red-50 text-red-700 border-red-200",
  warningBg: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

// Utility function to combine classes conditionally
export const classNames = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
