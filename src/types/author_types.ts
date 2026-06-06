

export type AuthorTypes = {

  name: string;
  description: string;
   tagline:string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  status: boolean;
   image: File | null;
};
export type AuthorResponse = {
  _id: string;
  name: string;
  description: string;
   tagline:string;
  linkedin: string;
  instagram: string;
  facebook: string;
  youtube: string;
  isActive: boolean;
  image: string; // URL from Cloudinary / server 
};
export type AuthorApiResponse = {
  success: boolean;
  count: number;
  data:AuthorResponse[];
};
