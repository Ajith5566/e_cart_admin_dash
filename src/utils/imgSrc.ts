import { BASE_URL } from "../services/baseURL";

 
export const imgSrc = (p?: string) =>
  !p ? "" : /^https?:\/\//i.test(p) ? p : `${BASE_URL}${p}`;