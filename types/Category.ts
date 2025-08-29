export interface ICategory {
  name: string;
  description: string;
  image?: string;
  subCategories: string[];
  updatedAt?: Date;
  createdAt?: Date;
}

export interface ICategoryInput {
  name: string;
  description: string;
  image?: string;
  subCategories?: string[];
}

export interface ICategoryUpdate {
  name?: string;
  description?: string;
  image?: string;
  subCategories?: string[];
  updatedAt?: Date;
}
