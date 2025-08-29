export interface ILoginHistory {
  loginAt?: Date;
  ipAddress?: string;
}

export interface IUser {
  name: string;
  email: string;
  role?: 'admin' | 'superadmin' | 'manager' | 'salesman';
  createdAt?: Date;
  loginHistory?: ILoginHistory[];
}

export interface IUserInput {
  name: string;
  email: string;
  role?: 'admin' | 'superadmin' | 'manager' | 'salesman';
}

export interface IUserUpdate {
  name?: string;
  email?: string;
  role?: 'admin' | 'superadmin' | 'manager' | 'salesman';
}

export interface IUserValidation {
  email: string;
}

export interface IUserAddRequest {
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'manager' | 'salesman';
}

export interface IUserUpdateRequest {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'superadmin' | 'manager' | 'salesman';
}

export interface IUserDeleteRequest {
  userId: string;
}
