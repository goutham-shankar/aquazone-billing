
export interface IProduct {
  name: string;
  description: string;
  image: string;
  category: string;
  subCategory?: string;
  price?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  remarks?: string;
  brand: string;
  stock: number;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface IProductInput {
  name: string;
  description: string;
  image: string;
  category: string;
  subCategory?: string;
  price?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  remarks?: string;
  brand: string;
  stock?: number;
}

export interface IProductUpdate {
  name?: string;
  description?: string;
  image?: string;
  category?: string;
  subCategory?: string;
  price?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  remarks?: string;
  brand?: string;
  stock?: number;
  updatedAt?: Date;
}

export interface IStockUpdate {
  stock: number;
  operation: 'set' | 'add' | 'subtract';
}
