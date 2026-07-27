export type IndustryResponse = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type IndustryFormData = {
  name: string;
  status: boolean;
  description: string;
  image: File | null;
};