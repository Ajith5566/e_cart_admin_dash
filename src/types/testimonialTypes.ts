
export type TestimonialTypes = {
  type: "text" | "video";
  name: string;
  designation: string;
  company: string;
  message: string;
  status: boolean;
  image: File | null;
  url: string;
  videoUrl: string;
  quote: string;
  services: string[];          // ✅ NEW — array of service IDs
  industry: string;            // ✅ NEW — industry ID
};
 
export type TestimonialResponse = {
  _id: string;
  type: "text" | "video";
  name: string;
  designation?: string;
  company?: string;
  message?: string;
  isActive: boolean;
  image?: string;
  url?: string;
  videoUrl?: string;
  quote?: string;
  services?: { _id: string; title: string; slug: string }[];  // ✅ NEW — populated
  industry?: { _id: string; name: string; slug: string } | null; // ✅ NEW — populated
  createdAt?: string;
};
 
export type TestimonialApiResponse = {
  success: boolean;
  count: number;
  data: TestimonialResponse[];
};