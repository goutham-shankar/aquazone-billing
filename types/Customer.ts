export interface IAddress {
  text: string;
  city: string;
  state: string;
  zip: string;
}

export interface ICustomer {
  name: string;
  address: IAddress;
  email?: string;
  phone?: string;
  lastPurchase?: Date;
  createdAt?: Date;
  gstNumber?: string;
}

export interface ICustomerInput {
  name: string;
  address: IAddress;
  email?: string;
  phone?: string;
  gstNumber?: string;
}

export interface ICustomerUpdate {
  name?: string;
  address?: Partial<IAddress>;
  email?: string;
  phone?: string;
  lastPurchase?: Date;
  gstNumber?: string;
}
