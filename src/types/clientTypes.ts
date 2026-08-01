export type ClientResponse = {
  _id: string;
  name: string;
  logo: string;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ClientTypes = {
  name: string;
  logo: File | null;
  isActive: boolean;
};