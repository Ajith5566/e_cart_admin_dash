import type { SolutionResponse } from "./solutionTypes";      
import type { IndustryResponse } from "./industryTypes";      
import type { ServiceResponse } from "./serviceTypes";
import type { TechnologyResponse } from "./technologyTypes";

// ✅ NEW — gallery item with label
export type CaseStudyGalleryItem = {
  _id?: string;
  image: string;
  label: string;
};

export type CaseStudyStatistic = {
  _id?: string;
  title: string;
  value: string;
  isFeatured: boolean;
};

export type CaseStudyTestimonial = {
  clientName: string;
  company: string;
  designation: string;
  quote: string;
  video: string;
  thumbnail: string;
};

export type CaseStudyResponse = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  clientName: string;
  clientCompany: string;
  clientDesignation: string;
  industry: IndustryResponse | null;
  services: ServiceResponse[];
  technologies: TechnologyResponse[];
  solutions: SolutionResponse[];
  relatedCaseStudies: Partial<CaseStudyResponse>[];
  timeline: string;
  websiteUrl: string;
  bannerImage: string;
  logo: string;
  gallery: CaseStudyGalleryItem[]; // ✅ was string[]
  overview: string;
  challenge: string;
  proposedSolution: string;
  implementation: string;
  outcome: string;
  statistics: CaseStudyStatistic[];
  testimonial: CaseStudyTestimonial;
  featured: boolean;
  displayOrder: number;            // ✅ NEW
  isActive: boolean;
  adminId?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};