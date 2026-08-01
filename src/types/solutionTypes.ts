// types/solutionTypes.ts
export type KeyPointItem = {
  icon: string;         // existing server path; "" for a not-yet-uploaded icon
  text: string;
  file?: File;           // client-only — present only for a newly-added, unsaved icon
  previewUrl?: string;   // client-only preview for the file above
};

export type SolutionTypes = {
  name: string;
  shortDescription: string;
  keyPoints: KeyPointItem[];
  relatedCaseStudies: string[];
  displayOrder: number;
  status: boolean; // isActive
  image: File | null;
};

export type SolutionResponse = {
  _id: string;
  name: string;
  shortDescription: string;
  image: string;
  keyPoints: { icon: string; text: string }[];
  relatedCaseStudies?: { _id: string; title: string }[];
  displayOrder: number;
  isActive: boolean;
  adminId?: string;
  createdAt: string;
  updatedAt: string;
};

export type SolutionApiResponse = {
  success: boolean;
  data: SolutionResponse[];
};