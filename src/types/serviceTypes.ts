// types/serviceTypes.ts
import type { MetaFields } from "./types";
import type { IndustryResponse } from "./industryTypes"; 

export type ServiceProcessItem = { title: string; description: string };
export type ServiceTechnologyItem = { technology: string; description: string };
export type ServiceFaqItem = { question: string; answer: string };

export type ServiceResponse = {
  _id: string;
  title: string;
  slug: string;
  parentService?: { _id: string; title: string } | null;

  // top-level fields
  description: string;
  bannerImage: string;
  bullets: string[];


  // leaf fields
  shortDescription: string;
  tagline: string;
  heroImage: string;
  introTitle: string;
  introDescription: string;
  process: ServiceProcessItem[];
  technologies: { technology: { _id: string; name: string; icon: string } | null; description: string }[];
  faqs: ServiceFaqItem[];
  industries:IndustryResponse[];
  featured: boolean;
  displayOrder: number;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
  meta?: MetaFields;
};

export type ServiceFormData = {
  title: string;
  parentService: string | null;
  status: boolean;
  featured: boolean;
  displayOrder: number;

  description: string;
  bullets: string[];
  bannerImage: File | null;

  shortDescription: string;
  tagline: string;
  introTitle: string;
  introDescription: string;
  process: ServiceProcessItem[];
  technologies: ServiceTechnologyItem[];
  heroImage: File | null;
};

export type ServiceRelations = {
  relatedCaseStudies: { _id: string; title: string; image: string; industry?: { _id: string; name: string } }[];
  relatedIndustries: { _id: string; name: string }[];
  relatedServices: { _id: string; title: string; shortDescription: string; slug: string }[];
};