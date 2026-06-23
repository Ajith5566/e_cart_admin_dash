// types/types.ts
export type LoginHistoryEntry = {
  _id: string;
  email: string;
  name: string | null;
  userId: string | null;
  status: "success" | "failed";
  reason?: string;
  ip: string;
  userAgent: string;
  timestamp: string;
};

export type LoginHistoryResponse = {
  success: boolean;
  data: LoginHistoryEntry[];
};