export interface BillItem {
  id: number;
  name: string;
  specialNote: string;
  quantity: number;
  price: number;
  amount: number;
  productId?: string; // Optional to handle manually added items
}

export type OrderType = 'delivery' | 'pickup' | 'dinein';

export type PaymentMethod = 'cash' | 'card' | 'due' | 'others' | 'part' | 'upi' | 'wallet' | 'gift_card' | 'split';

export interface BasicCustomerInfo {
  name: string;
  address: string;
  email: string;
}

export interface OrderSummary {
  totalQuantity: number;
  subTotal: number;
  discount: number;
  tax: number;
  deliveryCharge: number;
  containerCharge: number;
  grandTotal: number;
  customerPaid: number;
  returnToCustomer: number;
  tip: number;
}

export interface HeldBillInfo {
  id: string;
  items: number;
  customer: string;
  timestamp: Date;
}

export interface Customer {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export interface InvoiceItem {
  id: number;
  productId: number;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  sku: string;
  taxRate?: number;
  taxAmount?: number;
  taxIncluded?: boolean;
}

export interface InvoiceDetails {
  invoiceNumber: string;
  subject: string;
  dueDate: string;
  currency: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  amountDue: number;
  paymentMethod: PaymentMethod | string;
  status: 'active' | 'hold' | 'completed' | 'cancelled';
  amountPaid: number;
  change: number;
}

export interface HeldBill {
  id: string;
  invoice: InvoiceDetails;
  timestamp: Date;
}
export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Product {
  _id?: string;
  id: number;  // Changed to number to match with page.tsx
  name: string;
  category: Category | string;
  subCategory?: string;
  stock?: number;
  price: number;
  wholesalePrice?: number;
  retailPrice?: number;
  brand?: string;
  remarks?: string;
  description: string;
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  sku: string;
  barcode?: string;
  pluCode?: string;
  taxRate?: number;
  taxIncluded?: boolean;

}
export interface CustomerInfo {
  name: string;
  mobile?: string;
  email: string;
  address: string;
  notes?: string;
  [key: string]: string | undefined;
}

// Define CardType type for payment processing
export type CardType = 'credit' | 'debit' | 'visa' | 'mastercard' | 'amex' | 'discover' | 'other';

export interface PaymentDetails {
  method: PaymentMethod;
  // Card payment details
  cardType?: CardType;
  cardNumber?: string;
  expiryDate?: string;
  cvc?: string;
  cardholderName?: string;

  // Cash payment details
  amountReceived?: number;
  changeAmount?: number;

  // Part payment details
  partialAmount?: number;
  remainingAmount?: number;

  // Additional details can be added as needed
  reference?: string;
  savePaymentMethod?: boolean;
}