
import type { BannerApiResponse } from "../types/bannerTypes";
import type { BlogApiResponse } from "../types/blogTypes";
import type { CategoryApiResponse } from "../types/categoryTypes";
import type { TestimonialApiResponse } from "../types/testimonialTypes";
import type { AdminUserPayload,  FetchedAdminUser,  fetchedProducts, GetPagesResponse, PageType} from "../types/types";
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

//get profile
export const getProfileApi = () => {
  return commonApi(
    "GET",
    `${BASE_URL}/admin/profile`
  );
};


//update profile
export const updateProfileApi = (
  reqBody: unknown
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/profile/update`,
    reqBody
  );
};

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

//product status
export const toggleProductApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/product/${id}/toggle`
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

export const addPageApi = <T = unknown>(reqBody: unknown) => {
  return commonApi<T>(
    "POST",
    `${BASE_URL}/admin/pages`,
    reqBody
  );
};

export const getAllPagesApi = (
) => {
  return commonApi<PageType[]>(
    "GET",
    `${BASE_URL}/admin/pages`
  );
};

export const updatePageApi = (
  id: string,
  data: FormData
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


//add admin user
export const register_AdminUser_Api =async (reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/admin_users/register`,reqBody)
}

//fetch all admin users
export const getAdmin_UserApi = async () => {
  return await commonApi<FetchedAdminUser[]>("GET",`${BASE_URL}/admin_user/list`);
};

//delete admin user
export const deleteAdmin_userApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/user/delete/${id}`
  );
};

//toggle active or inactive user
export const Admin_user_isActiveApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/users/${id}/toggle`
  );
};

//update admin user details
export const updateAdmin_user_Api = (
  id: string,
  data: AdminUserPayload
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/user/update/${id}`,
    data
  );
};

/* ================= SETTINGS ================= */

export const getSettingsApi = () => {
  return commonApi(
    "GET",
    `${BASE_URL}/admin/settings`
  );
};

export const saveSettingsApi = (data: unknown) => {
  return commonApi(
    "POST",
    `${BASE_URL}/admin/settings`,
    data
  );
};


//forget password
export const forgotPasswordApi = (email: string) => {
  return commonApi(
    "POST",
    `${BASE_URL}/forgot-password`,
    { email }
  );
};

// reset admin password
export const resetPasswordApi = (
  token: string,
  password: string
) => {
  return commonApi(
    "POST",
    `${BASE_URL}/admin/reset-password/${token}`,
    { password }
  );
};


//category
//add 
export const add_category_Api =async (reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/product/category`,reqBody)
}

//get all category
export const getAllCategoriesApi = () => {
  return commonApi<CategoryApiResponse>("GET", `${BASE_URL}/get/categories`);
};

//category status
export const toggleCategoryApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/category/${id}/toggle`
  );
};

//update
export const updateCategoryApi = (
  id: string,
  data: FormData
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/CategoryUpdate/${id}`,
    data
  );
};

//blogs

//add blog 
export const add_blog_Api =async (reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/blogs`,reqBody)
}

//get all blog
export const getAllBlogsApi = () => {
  return commonApi<BlogApiResponse>("GET", `${BASE_URL}/get/blogs`);
};

//blog status
export const toggleBlogApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/blog/${id}/toggle`
  );
};

//update
export const updateBlogApi = (
  id: string,
  data: FormData
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/Updateblog/${id}`,
    data
  );
};

//delete
export const deleteblogApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/blog/delete/${id}`
  );
};

//add testimonial
export const add_testimonial_Api =async (reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/testimonials`,reqBody)
}

//get all testimonial
export const getAlltestimonialsApi = () => {
  return commonApi<TestimonialApiResponse>("GET", `${BASE_URL}/get/testimonials`);
};

//testimonial status
export const toggletestimonialApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/testimonial/${id}/toggle`
  );
};

//update
export const updatetestimonialApi = (
  id: string,
  data: FormData
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/Updatetestimonial/${id}`,
    data
  );
};

//delete
export const deletetestimonialApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/testimonial/delete/${id}`
  );
};

//add banner
export const add_banner_Api =async (reqBody:unknown)=>{
    return await commonApi('POST',`${BASE_URL}/banner`,reqBody)
}

//get all banners
export const getAllbannersApi = () => {
  return commonApi<BannerApiResponse>("GET", `${BASE_URL}/get/banners`);
};

//banners status
export const togglebannerApi = (id: string) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/banner/${id}/toggle`
  );
};

//update
export const updatebannerApi = (
  id: string,
  data: FormData
) => {
  return commonApi(
    "PUT",
    `${BASE_URL}/admin/Updatebanner/${id}`,
    data
  );
};

//delete
export const deletebannerApi = (id: string) => {
  return commonApi(
    "DELETE",
    `${BASE_URL}/admin/banner/delete/${id}`
  );
};