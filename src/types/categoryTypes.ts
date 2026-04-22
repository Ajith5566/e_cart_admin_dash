import type { MetaFields } from "./types";

/* category type */
export type CategoryTypes = {

  name: string;
  description: string;
   shortDescription:string;
  parentCategory: string;
  status: boolean;
   image: File | null;
};

export type CategoryResponse = {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  parent_category?: {
    _id: string;
    name: string;
  } | null;
  isActive: boolean;
  image: string; // URL from Cloudinary / server
   meta?: MetaFields; 
};

export type CategoryApiResponse = {
  success: boolean;
  count: number;
  data: CategoryResponse[];
};