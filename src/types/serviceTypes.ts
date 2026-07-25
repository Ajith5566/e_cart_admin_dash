export type ServiceResponse = {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  description: string;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type ServiceFormData = {
  name: string;
  status: boolean;
  description: string;
  icon: File | null;
};