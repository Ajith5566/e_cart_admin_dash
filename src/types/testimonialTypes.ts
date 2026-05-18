//testmonial types

export type TestimonialTypes = {

  name: string;
  designation: string;
   message:string;
  status: boolean;
   image: File | null;
   url:string;
};
export type TestimonialResponse = {
  _id: string;
   name: string;
  message: string;
  designation: string;
  isActive: boolean;
  image: string;
  url:string;
};
export type TestimonialApiResponse = {
  success: boolean;
  count: number;
  data: TestimonialResponse[];
};