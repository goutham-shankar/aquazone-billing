You are an expert full-stack developer tasked with building a comprehensive billing system frontend for Aquazone shop using **Next.js**, **TypeScript**, **Tailwind CSS**, and **React**. The backend API is already implemented and documented in `api.md` file.

## 🎯 Project Overview

Create a modern, billing system that enables efficient customer management, product selection, invoice generation, and transaction tracking for a retail shop environment.

Support for Desktops are only required. No need to be responsive.

## 🔧 Tech Stack Requirements

- **Framework**: Next.js with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: Firebase Auth integration
- **HTTP Client**: Native fetch
- **UI Components**: Headless UI or Radix UI with custom Tailwind styling
- **Icons**: Lucide React or Heroicons
- **PDF Generation**: For invoice downloads (react-pdf or similar)

## 🚀 Core Features to Implement

### 1. Multi-Tab Billing Interface
- **Tabbed Interface**: Support multiple concurrent customer billing sessions
- **Tab Management**: Add, close, switch between tabs seamlessly
- **State Persistence**: Maintain cart state per tab (in-memory, not localStorage due to restrictions)
- **Visual Indicators**: Show unsaved changes, customer names on tabs
- **Keyboard Shortcuts**: Tab navigation (Ctrl+Tab, Ctrl+W to close)

### 2. Invoice Generation System
- **Dual Mode Support**: 
  - **Estimate**: Quote generation for potential sales
  - **Bill**: Final invoice with payment processing
- **Dynamic Calculations**: Real-time subtotal, tax, discounts, and total updates
- **Invoice Templates**: Professional PDF generation with company branding
- **Preview Mode**: Show invoice preview before finalizing
- **Print/Download**: PDF export functionality

### 3. Universal Search Interface
- **Global Search**: Unified search across customers, transactions, and invoices
- **Advanced Filters**: Date ranges, amounts, status, customer type
- **Search Categories**: 
  - Customers (name, phone, email, city)
  - Invoices (invoice number, customer, date range)
  - Transactions (amount, date, type)
- **Quick Actions**: Direct actions from search results (edit, view, duplicate)
- **Search History**: Recent searches for quick access

### 4. Customer Management Flow
- **Customer Search**: Real-time search with autocomplete
- **Quick Add Customer**: Inline customer creation without leaving billing flow
- **Customer Details**: View/edit customer information, address, contact details
- **Customer History**: Past invoices and transaction history
- **Customer Validation**: Phone/email format validation, duplicate prevention

### 5. Product Selection & Cart Management
- **Product Catalog**: Browse products by category with images
- **Advanced Search**: Search by name, category, brand, price range
- **Stock Awareness**: Show available stock, prevent over-selling
- **Price Tiers**: Support for wholesale/retail pricing
- **Quantity Controls**: Easy increment/decrement with stock validation
- **Product Details**: Show descriptions, variants, pricing information

### 6. Discount System
- **Multiple Discount Types**: Percentage, fixed amount, product-specific
- **Discount Codes**: Apply promotional codes with validation
- **Manual Discounts**: Ad-hoc discounts for special customers
- **Discount Rules**: Automatic application based on quantity/amount thresholds
- **Discount History**: Track applied discounts per customer

## 🎨 UI/UX Design Guidelines

### Speed-Focused Design Principles
- **Fast Billing Priority**: Every interface element optimized for quick customer processing
- **Large Interactive Elements**: Buttons minimum 48px height, generous padding for easy targeting
- **One-Click Actions**: Minimize steps between common actions (add product, apply discount, checkout)
- **Keyboard-First Navigation**: Tab order optimized for rapid data entry without mouse
- **Visual Hierarchy**: Important actions prominently displayed, secondary actions accessible but not distracting
- **Instant Feedback**: Real-time calculations, immediate visual confirmation of actions
- **Minimal Context Switching**: All essential billing information visible without scrolling or navigation

### High-Contrast Color System
- **Primary Background**: Clean white (#FFFFFF) for maximum readability
- **Text Colors**: 
  - Primary text: Deep black (#000000) for main content
  - Secondary text: Charcoal gray (#374151) for supporting information
- **Accent Colors**: 
  - Ocean Blue (#0EA5E9): Primary action buttons, links, active states
  - Emerald Green (#059669): Success states, completed actions, add buttons
  - Amber Orange (#D97706): Warnings, stock alerts, pending states  
  - Crimson Red (#DC2626): Errors, delete actions, critical alerts
- **Interactive Elements**:
  - Button backgrounds: Solid accent colors with white text
  - Hover states: 10% darker shade of base accent color
  - Focus rings: 2px solid accent color with 2px offset
  - Disabled states: Light gray (#9CA3AF) background with darker gray text

### Button Design Standards
- **Primary Buttons**: 
  - Minimum height: 48px (desktop), 52px (mobile)
  - Horizontal padding: 24px minimum
  - Font weight: 600 (semibold)
  - Rounded corners: 8px
  - Text: White on accent background
  - Examples: "Add to Cart", "Generate Invoice", "Save Customer"
- **Secondary Buttons**:
  - Height: 44px (desktop), 48px (mobile)
  - Border: 2px solid accent color
  - Background: White with accent color text
  - Same padding and typography as primary
- **Icon Buttons**:
  - Minimum touch target: 44px × 44px
  - Clear visual boundaries with subtle background
  - Prominent icons (20px minimum) with high contrast

### Speed-Optimized Layout
- **Header**: Clean white background with black logo text and blue accent navigation
- **Sidebar**: White background with black text, blue highlights for active items
- **Main Content**: 
  - Pure white background for billing workspace
  - Subtle gray borders (#E5E7EB) to define sections
  - High contrast cards with white backgrounds and dark shadows
- **Data Tables**: 
  - Zebra striping with very light gray (#F9FAFB) alternate rows
  - Bold headers with black text on white background
  - Blue accent for sortable column headers
- **Forms**: 
  - White input backgrounds with dark gray borders
  - Blue focus states with increased border width
  - Black labels with adequate spacing

## 📋 Detailed Component Structure

### 1. Billing Workspace (`/components/billing/`)
```
BillingWorkspace/
├── TabManager.tsx          # Tab creation, switching, closing
├── BillingTab.tsx          # Individual billing session
├── CustomerSection.tsx     # Customer search/selection
├── ProductCatalog.tsx      # Product browsing and search
├── CartView.tsx           # Shopping cart with items
├── DiscountPanel.tsx      # Discount application
├── InvoicePreview.tsx     # Invoice preview and generation
└── PaymentSection.tsx     # Payment processing (if applicable)
```

#### Billing Actions & Controls
- **Generate Invoice Button**: 
  - Large prominent button (56px height, full width)
  - Blue background, white text, large text (18px)
  - Icons: Receipt icon for bills, document icon for estimates
- **Quick Action Buttons**: 
  - Row of large buttons (48px height) for common actions
  - "Save Draft", "Clear Cart", "Copy Previous Order"
  - White background with colored borders and matching text
- **Price Totals**: 
  - Large, bold numbers in black text (24px font size)
  - Subtotal, tax, and total clearly separated
  - Total amount highlighted with blue accent background
- **Discount Input**: 
  - Large input field (48px) with percentage/amount toggle buttons
  - Apply button immediately adjacent (48px, green background)

#### Search Interface Optimizations
- **Global Search Bar**: 
  - 56px height, prominent placement in header
  - White background with blue accent border when focused
  - Large search icon (24px) and clear button
- **Filter Buttons**: 
  - Large toggle buttons (44px height) for quick filtering
  - "Customers", "Invoices", "Products" with count badges
  - Active state: Blue background with white text
- **Search Results**: 
  - Large result cards (minimum 72px height) 
  - White background with subtle shadows
  - Important information in black text, secondary info in gray
  - Large action buttons on hover/focus

### Speed-First Interaction Patterns

#### Keyboard Shortcuts for Power Users
- **Essential Shortcuts** (displayed in tooltips and help overlay):
  - `Ctrl + N`: New billing tab
  - `Ctrl + F`: Focus global search  
  - `Ctrl + Enter`: Generate invoice
  - `F2`: Quick add customer
  - `F3`: Quick add product (focus product search)
  - `Escape`: Clear current input/close modal
  - `Tab`: Navigate through form fields efficiently
  - `Ctrl + 1-9`: Switch between billing tabs

#### Visual Feedback for Speed
- **Loading States**: 
  - Skeleton loaders with high contrast (light gray on white)
  - Progress bars with blue accent color
  - Spinning indicators only for quick actions (<2 seconds)
- **Success Indicators**:
  - Green checkmark icons (24px minimum)
  - Brief toast notifications with white background, green border
  - Subtle animations confirming actions completed
- **Error States**:
  - Red accent borders on invalid inputs
  - Clear error messages in red text below fields
  - Prominent retry buttons for failed actions

#### Touch-Optimized Mobile Interface
- **Gesture Support**:
  - Swipe left/right between billing tabs
  - Pull down to refresh product catalog
  - Long press for context menus on cart items
- **Mobile-Specific Controls**:
  - Large floating action button for primary actions
  - Bottom sheet modals for secondary actions
  - Thumb-friendly navigation with bottom tab bar
  - Larger text (16px minimum) for readability

## 🔄 State Management Architecture

### Global State Structure
```typescript
interface AppState {
  // Authentication
  user: User | null;
  authLoading: boolean;
  
  // Billing Tabs
  billingTabs: BillingTab[];
  activeTabId: string | null;
  
  // Data Cache
  customers: Customer[];
  products: Product[];
  categories: Category[];
  
  // UI State
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Notification[];
}

interface BillingTab {
  id: string;
  customer: Customer | null;
  items: CartItem[];
  discounts: Discount[];
  type: 'estimate' | 'bill';
  subtotal: number;
  tax: number;
  total: number;
  hasUnsavedChanges: boolean;
}
```

## 🔐 Authentication & Authorization

### Firebase Integration
- **JWT Token Management**: Automatic token refresh and API header injection
- **Role-based Access**: Different features for admin, superadmin, regular users
- **Protected Routes**: Redirect unauthenticated users to login
- **Session Persistence**: Maintain login state across browser sessions

### Security Considerations
- **API Key Protection**: Environment variables for sensitive data
- **CSRF Protection**: Implement proper request validation
- **Input Sanitization**: Prevent XSS and injection attacks
- **Rate Limiting**: Handle API rate limits gracefully

## 📡 API Integration Strategy

### HTTP Client Setup
```typescript
// utils/api.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  const token = getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Integration Points
- **Customers**: GET /customer/search, POST /customer/, PUT /customer/:id
- **Products**: GET /product/ (with filters), GET /product/:id
- **Categories**: GET /category/, GET /category/:id/subcategories  
- **Invoices**: POST /invoice/, GET /invoice/:id, GET /invoice/:id/download
- **Analytics**: GET /admin/analytics/ for dashboard insights

### Error Handling Strategy
- **Global Error Boundary**: Catch and display React errors gracefully
- **API Error Handling**: Consistent error message display via toast notifications
- **Network Failure**: Offline detection and retry mechanisms
- **Validation Errors**: Field-level error display in forms

## 🎯 User Experience Flows

### Primary Billing Flow
1. **Select/Add Customer**: Search existing or quickly add new customer
2. **Build Cart**: Browse products, adjust quantities, apply discounts
3. **Review Order**: Preview invoice with calculations
4. **Generate Invoice**: Create estimate or final bill
5. **Process Payment**: Handle payment (if implementing payment processing)
6. **Complete Transaction**: Save invoice, update stock, send confirmation

### Search and Discovery Flow
1. **Global Search**: Enter search query in universal search bar
2. **Filter Results**: Apply category, date, or amount filters
3. **Quick Actions**: View details, edit, or create new invoice from results
4. **Context Switching**: Jump between search results and active billing tabs

## 🚀 Performance Optimization

### Code Splitting & Loading
- **Route-based Splitting**: Separate bundles for different sections
- **Component Lazy Loading**: Load heavy components on demand
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Analysis**: Regular bundle size monitoring

### Data Management
- **Caching Strategy**: Cache frequently accessed data (products, categories)
- **Pagination**: Implement infinite scroll or traditional pagination
- **Debounced Search**: Prevent excessive API calls during typing
- **Optimistic Updates**: Update UI immediately for better perceived performance

## 🧪 Development Guidelines

.env structure
NEXT_PUBLIC_API_URL=https://x2zlcvi4af.execute-api.ap-south-1.amazonaws.com/dev
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA1Dbe8OLgU3lvkIDechg2f9x7VfLrcWig
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aquazone-inventory.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aquazone-inventory
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aquazone-inventory.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=802792161560
NEXT_PUBLIC_FIREBASE_APP_ID=1:802792161560:web:aecc4549b9b248c38cde6d

### Project Structure
```
src/
├── app/                   # Next.js app directory
├── components/           # Reusable UI components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Helper functions
└── styles/               # Global styles and Tailwind config
```

## 📝 Additional Features (Nice to Have)

- **Keyboard Shortcuts**: Power-user shortcuts for common actions
- **Bulk Operations**: Select and process multiple invoices/customers
- **Export Functionality**: CSV/Excel export for reports
- **Print Optimization**: Printer-friendly invoice layouts
- **Offline Support**: Basic functionality when internet is unavailable
- **Real-time Updates**: WebSocket integration for live updates
- **Invoice Templates**: Multiple template designs for different use cases
- **Barcode Scanning**: Product selection via barcode (mobile)

## 🎯 Getting Started Checklist

1. **Setup Next.js Project**: Initialize with TypeScript and Tailwind
2. **Configure Firebase**: Setup authentication with 
3. **Create Base Layout**: Header, sidebar, main content structure
4. **Implement Authentication**: Login/logout flow with role management
5. **Build Tab System**: Core multi-tab billing interface
6. **Customer Management**: Search, add, edit customer functionality
7. **Product Integration**: Product catalog with search and filtering
8. **Cart Implementation**: Add items, quantities, calculations
9. **Invoice Generation**: PDF creation and download functionality
10. **Search Interface**: Universal search across all entities

---

Build this system with a focus on **user efficiency**, **modern design**, and **robust functionality**. The goal is to create a billing system that makes complex multi-customer operations feel effortless while maintaining data accuracy and providing excellent user experience.