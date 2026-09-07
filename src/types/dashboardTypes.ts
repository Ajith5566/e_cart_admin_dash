// types/dashboardTypes.ts

export type LatestEnquiry = {
  _id:       string;
  name:      string;
  email:     string;
  phone:     string;
  message:   string;
  createdAt: string;
};

export type LatestApplication = {
  _id:       string;
  name:      string;
  email:     string;
  phone:     string;
  jobTitle:  string;
  status:    "new" | "shortlisted" | "rejected" | "hired";
  isRead:    boolean;
  createdAt: string;
};

export type DashboardOverviewResponse = {
  counts: {
    enquiries:       number;
    applications:    number;
    newApplications: number;
  };
  latestEnquiries:    LatestEnquiry[];
  latestApplications: LatestApplication[];
};