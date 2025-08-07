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

export type PaymentMethod = 'cash' | 'card' | 'due' | 'others' | 'part';

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
// Add this to your existing types.ts file

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface Product {
  _id?: string;
  id?: string;  // Keeping for backwards compatibility
  name: string;
  category: Category | string;
  subCategory?: string;
  stock?: number;
  price: number;
  wholesalePrice?: number;
  retailPrice?: number;
  brand?: string;
  remarks?: string;
  description?: string;
  image?: string;
  imageUrl?: string;  // Keeping for backwards compatibility
  createdAt?: string;
  updatedAt?: string;
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