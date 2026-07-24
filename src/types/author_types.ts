

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
   twitter: string;
};
export type AuthorResponse = {
  _id: string;
  name: string;
  tagline?: string;
  description?: string;
  image?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;   // ← ADD
  isActive: boolean;
  adminId?: string;
  createdAt: string;
};
export type AuthorApiResponse = {
  success: boolean;
  count: number;
  data:AuthorResponse[];
};
