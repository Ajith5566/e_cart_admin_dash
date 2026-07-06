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
   rememberMe?: boolean;
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
  name:string;
  role: "super_admin" | "staff";
  isActive?: boolean;
}

export interface AdminResponse {
  admin: Admin;
  message: string;
}

//poduct type
export type AdminProduct = {
  name: string;
  price: number | string;
  quantity: number | string;
  shortDescription:string;
  description:string;
  status: boolean;
  category:string;
  images: File[]
};

//product types
export type fetchedProducts={
  _id: string;
  productName: string;
  price: number | string;
  quantity: number | string;
  description:string;
  shortDescription:string;
  category?: {
    _id: string;
    name: string;
  } | null;
  isActive: boolean;
  images:string[]; // image URL
   meta?: MetaFields;    // ✅ add this
   adminId:string;
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
  slug: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
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
export type AdminUserPayload = {
  name: string;
  email: string;
  password?: string;
  role: string;
};


//seo types

// types/types.ts
export type MetaFields = {
  slug?: string;
  meta_title?: string;
  meta_keywords?: string[];
  meta_description?: string;
  canonical_url?: string;

  og_title?: string;
  og_description?: string;
  og_image?: File | string | null;

  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: File | string | null;

  schema_markup?: string;

  allow_indexing?: boolean;
  allow_following?: boolean;
  include_sitemap?: boolean;
  sitemap_priority?: string;
  change_frequency?: string;
};