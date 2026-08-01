// types/testimonialTypes.ts

export type TestimonialTypes = {
  type: "text" | "video";  // ✅ NEW
  name: string;
  designation: string;
  company: string;          // ✅ NEW
  message: string;
  status: boolean;
  image: File | null;
  url: string;
  videoUrl: string;         // ✅ NEW
  quote: string;            // ✅ NEW
};

export type TestimonialResponse = {
  _id: string;
  type: "text" | "video";  // ✅ NEW
  name: string;
  designation: string;
  company?: string;         // ✅ NEW
  message?: string;
  isActive: boolean;
  image?: string;
  url?: string;
  videoUrl?: string;        // ✅ NEW
  quote?: string;           // ✅ NEW
  createdAt?: string;
};

export type TestimonialApiResponse = {
  success: boolean;
  count: number;
  data: TestimonialResponse[];
};