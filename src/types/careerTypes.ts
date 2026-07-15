export type CareerStatus = "new" | "shortlisted" | "rejected" | "hired";
 
export type CareerResponse = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  cvUrl: string;       // stored filename on the server
  cvFileName: string;  // original filename e.g. "vivek_resume.pdf"
  status: CareerStatus;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};
 
export type CareerApiResponse = {
  success: boolean;
  data: CareerResponse[];
};