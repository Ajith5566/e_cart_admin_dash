import type { fetchedProducts, GetPagesResponse } from "../types/types";
import { BASE_URL } from "./baseURL";
import { commonApi } from "./commonAPi";



export type PagePayload = {
  title: string;
  shortDescription: string;
  description: string;
};


//admin login
export const adminloginAPi=async(reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/admin/login`,reqBody)
}

//add product

export const AddproductApi = async <T = unknown>(reqBody: unknown,reqHeader?: Record<string, string>) => {
  return await commonApi<T>("POST", `${BASE_URL}/add-product`, reqBody, reqHeader);
};

//product list admin

export const getAllProductsApi = async () => {
  return await commonApi<fetchedProducts[]>("GET",`${BASE_URL}/admin/products`);
};

//product delete

export const deleteProductApi = (id: string, token: string) => {
  return commonApi("DELETE",`${BASE_URL}/admin/product/${id}`,"",
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

//product update api
export const updateProductApi=(id: string, data: FormData, token:string)=>{
  return commonApi("PUT",`${BASE_URL}/admin/productUpdate/${id}`,data,
    {
    Authorization: `Bearer ${token}`,
  }
  );
}

//get user list for admin dashboard

export const getAllusersApi = async ( token: string,
  page = 1,
  limit = 5) => {
  return await commonApi<GetPagesResponse>("GET",`${BASE_URL}/admin/dash/users?page=${page}&limit=${limit}`);

};

//block user
export const blockUserApi=(id:string,token:string)=>{
  return commonApi("PUT",`${BASE_URL}/admin/dash/blockUser/${id}`,{},
    {
      Authorization: `Bearer ${token}`,
    }
  )
}


//get product by id
export const getProductByIdApi = (id: string) => {
  return commonApi<fetchedProducts>("GET", `${BASE_URL}/productsByid/${id}`);
};



// ➕ Add new page
export const addPageApi = (
  data: PagePayload,
  token: string
) => {
  return commonApi(
    "POST",
    `${BASE_URL}/admin/pages`,
    data,
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

// 📄 Get all pages (admin list)
export const getAllPagesApi = (
  token: string,
  page = 1,
  limit = 5
) => {
  return commonApi(
    "GET",
    `${BASE_URL}/admin/pages?page=${page}&limit=${limit}`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  );
};


// ✏️ Update page
export const updatePageApi = (
  id: string,
  data: PagePayload,
  token: string
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/pages/${id}`,
    data,
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

// 🗑️ Delete page
export const deletePageApi = (
  id: string,
  token: string
) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/pages/${id}`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

// 🔄 Toggle publish / unpublish
export const togglePageApi = (
  id: string,
  token: string
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/pages/${id}/toggle`,
    "",
    {
      Authorization: `Bearer ${token}`,
    }
  );
};