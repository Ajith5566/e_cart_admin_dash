export type JobType = "Full time" | "Part time" | "Contract" | "Internship" | "Remote";
 
export type JobResponse = {
  _id: string;
  title: string;
  skills: string[];
  experience: string;
  jobType: JobType;
  location: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
 