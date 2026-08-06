import type { MetaFields } from "./types";
import type { ContentBlock } from "./contentBlockTypes";
import type { ServiceResponse } from "./serviceTypes";
import type { CaseStudyResponse } from "./caseStudyTypes";

export type BlogPublicationStatus = "draft" | "published";
export type BlogFaqItem = { question: string; answer: string };


export type BlogTypes = {
  title: string;
  shortDescription: string;
  contentBlocks: ContentBlock[]; // ✅ REPLACES description / quote / youtubeUrl
  readTime: number;
  tags: string[];
  author: string;
  status: boolean; // isActive — visibility toggle, independent of draft/published
  publicationStatus: BlogPublicationStatus;
  image: File | null;
  services: ServiceResponse[];
   relatedCaseStudies: Partial<CaseStudyResponse>[];
};

export type BlogResponse = {
  _id: string;
  title: string;
  shortDescription: string;
  contentBlocks: ContentBlock[]; // ✅ REPLACES description / quote / youtubeUrl
  readTime: number;
  views: number;

  author?: {
    _id: string;
    name: string;
  } | null;

  image: string;
  isActive: boolean;
  adminId?: string;

  publicationStatus: BlogPublicationStatus;
  publishedAt: string | null;
  lastContentUpdatedAt: string | null;

  createdAt: string;
  updatedAt: string;

  meta?: MetaFields;
   faqs: BlogFaqItem[];
   services: ServiceResponse[];
   relatedCaseStudies: Partial<CaseStudyResponse>[];
};

export type BlogApiResponse = {
  success: boolean;
  data: BlogResponse[];
};