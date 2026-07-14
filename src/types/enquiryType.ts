export type EnquiryForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
  
};

export type EnquiryResponse = {
  _id: string;
  name: string;
   email: string;
   message:string;
   phone:string;
   createdAt:string;
};

export type EnquiryApiResponse = {
  success: boolean;
  count: number;
  data: EnquiryResponse[];
};