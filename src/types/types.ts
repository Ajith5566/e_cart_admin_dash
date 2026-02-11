export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
 
export interface FormErrors {
  username: string;
  email: string;
  password: string;
  confirmPassword:string;
}

export interface LoginFormData{
  email:string;
  password:string
}

export interface LoginFormError{
  email:string;
  password:string;
}
export interface User {
  _id: string;
  username: string;
  mailId: string;
  isBlocked:boolean
}
export interface LoginResponse {
  existingUser: User;
  token: string;
}

export interface Admin {
  _id: string;
  email: string;
}

export interface AdminResponse {
  admin: Admin;
  token: string;
}

//poduct type
export type AdminProduct = {
  name: string;
  price: number | string;
  quantity: number | string;
  images: File[]
};

//product types
export type fetchedProducts={
  _id: string;
  productName: string;
  price: number | string;
  quantity: number | string;
  images:string[]; // image URL

}
//paginate
export type ProductResponse = {
  docs: fetchedProducts[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
};

//user pgination
export type GetPagesResponse = {
  docs: User[];
  totalDocs: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PageType = {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
};

//types for adding admin
export type AdminUser={
  name: string,
    email: string,
    password: string,
    confirmPassword: string,
    role:string
}



//type for fetching all admin users
export type FetchedAdminUser={
   _id: string;
  name: string,
    email: string,
    password: string,
    confirmPassword: string,
    isActive:boolean,
    role:string
}
export type GetUserResponse = {
  docs: FetchedAdminUser[];
  totalDocs: number;
  totalPages: number;
};
export type AdminUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
};
