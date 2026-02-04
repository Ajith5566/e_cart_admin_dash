import type { fetchedProducts, GetPagesResponse } from "../types/types";
import { BASE_URL } from "./baseURL";
import { commonApi } from "./commonAPi";

export type PagePayload = {
  title: string;
  shortDescription: string;
  description: string;
};

/* ================= AUTH ================= */

// admin login (sets cookie)
export const adminloginAPi = (reqBody: unknown) => {
  return commonApi("POST", `${BASE_URL}/admin/login`, reqBody);
};

// verify cookie
export const checkAdminAuthApi = () => {
  return commonApi("GET", `${BASE_URL}/admin/me`);
};

// logout (clears cookie)
export const adminLogoutApi = () => {
  return commonApi("POST", `${BASE_URL}/admin/logout`);
};

/* ================= USERS ================= */

export const getAllusersApi = (
  page = 1,
  limit = 5
) => {
  return commonApi<GetPagesResponse>(
    "GET",
    `${BASE_URL}/admin/dash/users?page=${page}&limit=${limit}`
  );
};

export const blockUserApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/dash/blockUser/${id}`
  );
};

/* ================= PRODUCTS ================= */

export const AddproductApi = <T = unknown>(reqBody: unknown) => {
  return commonApi<T>(
    "POST",
    `${BASE_URL}/add-product`,
    reqBody
  );
};

export const getAllProductsApi = () => {
  return commonApi<fetchedProducts[]>(
    "GET",
    `${BASE_URL}/admin/products`
  );
};

export const deleteProductApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/product/${id}`
  );
};

export const updateProductApi = (
  id: string,
  data: FormData
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/productUpdate/${id}`,
    data
  );
};

export const getProductByIdApi = (id: string) => {
  return commonApi<fetchedProducts>(
    "GET",
    `${BASE_URL}/productsByid/${id}`
  );
};

/* ================= PAGES ================= */

export const addPageApi = (data: PagePayload) => {
  return commonApi(
    "POST",
    `${BASE_URL}/admin/pages`,
    data
  );
};

export const getAllPagesApi = (
  page = 1,
  limit = 5
) => {
  return commonApi(
    "GET",
    `${BASE_URL}/admin/pages?page=${page}&limit=${limit}`
  );
};

export const updatePageApi = (
  id: string,
  data: PagePayload
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/pages/${id}`,
    data
  );
};

export const deletePageApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/pages/${id}`
  );
};

export const togglePageApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/pages/${id}/toggle`
  );
};



