import type { CaseStudyResponse } from "./caseStudyTypes";

export type ClientResponse = {
  _id: string;
  name: string;
  logo: string;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
  caseStudy: CaseStudyResponse |  null;
};

export type ClientTypes = {
  name: string;
  logo: File | null;
  isActive: boolean;
  caseStudy: CaseStudyResponse |  null;
};