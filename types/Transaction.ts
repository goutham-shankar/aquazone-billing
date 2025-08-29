export interface ITransaction {
  customerId: string;
  invoiceId: string;
  paymentMethod: 'card' | 'upi' | 'cash';
  amount: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: number;
  salesman: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface ITransactionInput {
  customerId: string;
  invoiceId: string;
  paymentMethod: 'card' | 'upi' | 'cash';
  amount: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  salesman: string;
}

export interface ITransactionUpdate {
  customerId?: string;
  invoiceId?: string;
  paymentMethod?: 'card' | 'upi' | 'cash';
  amount?: number;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  salesman?: string;
  updatedAt?: Date;
}
