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
  description: string;
  shortDescription: string;
  author?: {
    _id: string;
    name: string;
  } | null;
  isActive: boolean;
  image: string; // URL from Cloudinary / server
   meta?: MetaFields; 
   adminId:string;
};

export type BlogApiResponse = {
  success: boolean;
  count: number;
  data: BlogResponse[];
};
