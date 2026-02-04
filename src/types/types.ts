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
  image: File | null;
};

//product types
export type fetchedProducts={
  _id: string;
  productName: string;
  price: number | string;
  quantity: number | string;
  image: string; // image URL

}

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