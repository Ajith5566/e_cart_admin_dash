export type TechnologyResponse = {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  isActive: boolean;
  description:string;
  displayOrder: number;
  adminId?: string;
  createdAt: string;
  updatedAt: string;

};
 
export type TechnologyFormData = {
  name: string;
  status: boolean;
  logo: File | null;
};