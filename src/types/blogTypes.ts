import type { MetaFields } from "./types";

export type BlogTypes = {

  title: string;
  description: string;
   shortDescription:string;
  author: string;
  status: boolean;
   image: File | null;
};



 
export type BlogResponse = {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;

  author?: {
    _id: string;
    name: string;
  } | null;

  image: string;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
  meta?: MetaFields;
};
 
export type BlogApiResponse = {
  success: boolean;
  data: BlogResponse[];
};