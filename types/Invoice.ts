export interface IInvoiceProduct {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDiscount {
  name: string;
  amount: number;
  code: string;
}

export interface IInvoiceAmount {
  subTotal: number;
  tax: number;
  total: number;
}

export interface IInvoiceAddress {
  billing: string;
  shipping: string;
}

export interface IInvoice {
  invoiceId?: number;
  amount: IInvoiceAmount;
  address: IInvoiceAddress;
  discounts?: IDiscount[];
  items: IInvoiceProduct[];
  customer: string;
  salesman: string;
  type?: 'estimate' | 'bill';
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IInvoiceInput {
  amount: IInvoiceAmount;
  address: IInvoiceAddress;
  discounts?: IDiscount[];
  items: Array<{
    _id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  customer: string;
  salesman: string;
  type?: 'estimate' | 'bill';
}

export interface IInvoiceUpdate {
  amount?: Partial<IInvoiceAmount>;
  address?: Partial<IInvoiceAddress>;
  discounts?: IDiscount[];
  items?: IInvoiceProduct[];
  customer?: string;
  salesman?: string;
  type?: 'estimate' | 'bill';
  updatedAt?: Date;
}

export interface IInvoiceQuery {
  customer?: string;
  salesman?: string;
  type?: 'estimate' | 'bill';
  page?: number;
  limit?: number;
}
