export type SolutionResponse = {
  _id: string;
  name: string;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SolutionFormData = {
  name: string;
  status: boolean;
};