// types/faqTypes.ts
export type FaqResponse = {
  _id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type FaqFormData = {
  question: string;
  answer: string;
  displayOrder: number;
  status: boolean;
};