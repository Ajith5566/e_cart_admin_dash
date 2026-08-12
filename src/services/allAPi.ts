import type { PaginationMeta } from "../components/hooks/useServerPagination";
import type { AuthorApiResponse, AuthorResponse } from "../types/author_types";
import type { BannerApiResponse, BannerResponse } from "../types/bannerTypes";
import type { BlogApiResponse, BlogFaqItem, BlogResponse } from "../types/blogTypes";
import type { CareerApiResponse, CareerResponse, CareerStatus } from "../types/careerTypes";
import type { CategoryApiResponse, CategoryResponse } from "../types/categoryTypes";
import type { EnquiryApiResponse, EnquiryResponse } from "../types/enquiryType";
import type { JobResponse } from "../types/jobTypes";
import type { LoginHistoryEntry, LoginHistoryParams } from "../types/login_history";
import type {
  AuthCheckResponse,
  ModulePermission,
  ModulesResponse,
  PermissionResponse,
} from "../types/permissionTypes";
import type { ServiceResponse, ServiceRelations, ServiceFaqItem } from "../types/serviceTypes";
import type { TechnologyResponse } from "../types/technologyTypes";
import type { TestimonialApiResponse, TestimonialResponse } from "../types/testimonialTypes";
import type {
  AdminUserPayload,
  FetchedAdminUser,
  fetchedProducts,
  GetPagesResponse,
  PageType,
} from "../types/types";
  import type { IndustryResponse } from "../types/industryTypes";
   import type { SolutionApiResponse, SolutionResponse } from "../types/solutionTypes";
   import type { CaseStudyResponse } from "../types/caseStudyTypes";
import { BASE_URL } from "./baseURL";
import { commonApi } from "./commonAPi";
import type { ClientResponse } from "../types/clientTypes";
import type { FaqResponse } from "../types/faqTypes";

export type PagePayload = {
  title: string;
  shortDescription: string;
  description: string;
};

/* ============================================================
   AUTH
   ============================================================ */

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

/* ============================================================
   USERS
   ============================================================ */

// login history
export const getLoginHistoryApi = (params: LoginHistoryParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.append(k, String(v));
  });
  return commonApi<{ success: boolean; data: LoginHistoryEntry[]; pagination: PaginationMeta }>(
    "GET",
    `${BASE_URL}/admin/login-history?${query.toString()}`
  );
};

// get profile
export const getProfileApi = () => {
  return commonApi("GET", `${BASE_URL}/admin/profile`);
};

// update profile
export const updateProfileApi = (reqBody: unknown) => {
  return commonApi("PUT", `${BASE_URL}/admin/profile/update`, reqBody);
};

export const getAllusersApi = (page = 1, limit = 5) => {
  return commonApi<GetPagesResponse>(
    "GET",
    `${BASE_URL}/admin/dash/users?page=${page}&limit=${limit}`
  );
};

export const blockUserApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/dash/blockUser/${id}`);
};

/* ============================================================
   PRODUCTS
   ============================================================ */

export const AddproductApi = <T = unknown>(reqBody: unknown) => {
  return commonApi<T>("POST", `${BASE_URL}/add-product`, reqBody);
};

export const toggleProductApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/product/${id}/toggle`);
};

export const getAllProductsApi = () => {
  return commonApi<fetchedProducts[]>("GET", `${BASE_URL}/admin/products`);
};

export const deleteProductApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/product/${id}`);
};

export const updateProductApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/productUpdate/${id}`, data);
};

export const getProductByIdApi = (id: string) => {
  return commonApi<fetchedProducts>("GET", `${BASE_URL}/productsByid/${id}`);
};

/* ============================================================
   PAGES
   ============================================================ */

export const addPageApi = <T = unknown>(reqBody: unknown) => {
  return commonApi<T>("POST", `${BASE_URL}/admin/pages`, reqBody);
};

export const getAllPagesApi = () => {
  return commonApi<PageType[]>("GET", `${BASE_URL}/admin/pages`);
};

export const getPageByIdApi = (id: string) => {
  return commonApi<PageType>("GET", `${BASE_URL}/pagebyid/${id}`);
};

export const updatePageApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/pages/${id}`, data);
};

export const deletePageApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/pages/${id}`);
};

export const togglePageApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/pages/${id}/toggle`);
};

export const bulkTogglePagesApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/pages/bulk-status`,
    { ids, isActive }
  );

export const bulkDeletePagesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/pages/bulk-delete`,
    { ids }
  );

/* ============================================================
   ADMIN USERS
   ============================================================ */

// add admin user
export const register_AdminUser_Api = async (reqBody: unknown) => {
  return await commonApi("POST", `${BASE_URL}/admin_users/register`, reqBody);
};

// fetch all admin users
export const getAdmin_UserApi = async () => {
  return await commonApi<FetchedAdminUser[]>("GET", `${BASE_URL}/admin_user/list`);
};

// delete admin user
export const deleteAdmin_userApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/user/delete/${id}`);
};

export const getuserByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: FetchedAdminUser }>(
    "GET",
    `${BASE_URL}/userByid/${id}`
  );
};

// toggle active or inactive user
export const Admin_user_isActiveApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/users/${id}/toggle`);
};

// update admin user details
export const updateAdmin_user_Api = (id: string, data: AdminUserPayload) => {
  return commonApi("PUT", `${BASE_URL}/admin/user/update/${id}`, data);
};

/* ============================================================
   SETTINGS
   ============================================================ */

export const getSettingsApi = () => {
  return commonApi("GET", `${BASE_URL}/admin/settings`);
};

export const saveSettingsApi = (data: unknown) => {
  return commonApi("POST", `${BASE_URL}/admin/settings`, data);
};

// forget password
export const forgotPasswordApi = (email: string) => {
  return commonApi("POST", `${BASE_URL}/forgot-password`, { email });
};

// reset admin password
export const resetPasswordApi = (token: string, password: string) => {
  return commonApi("POST", `${BASE_URL}/admin/reset-password/${token}`, { password });
};

export const verifyResetTokenApi = (token: string) => {
  return commonApi("GET", `${BASE_URL}/admin/reset-password/${token}/verify`, {});
};

/* ============================================================
   CATEGORY
   ============================================================ */

// add
export const add_category_Api = async (reqBody: unknown) => {
  return await commonApi("POST", `${BASE_URL}/product/category`, reqBody);
};

// get all
export const getAllCategoriesApi = () => {
  return commonApi<CategoryApiResponse>("GET", `${BASE_URL}/get/categories`);
};

// status toggle
export const toggleCategoryApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/category/${id}/toggle`);
};

// update
export const updateCategoryApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/CategoryUpdate/${id}`, data);
};

export const getCategoryByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: CategoryResponse }>(
    "GET",
    `${BASE_URL}/categoryByid/${id}`
  );
};

/* ============================================================
   BLOGS
   ============================================================ */

// add
export const add_blog_Api = async (reqBody: unknown) => {
  return await commonApi("POST", `${BASE_URL}/blogs`, reqBody);
};

// get all
export const getAllBlogsApi = () => {
  return commonApi<BlogApiResponse>("GET", `${BASE_URL}/get/blogs`);
};

// status toggle
export const toggleBlogApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/blog/${id}/toggle`);
};

// update
export const updateBlogApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/Updateblog/${id}`, data);
};

// delete
export const deleteblogApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/blog/delete/${id}`);
};

export const getBlogByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: BlogResponse }>(
    "GET",
    `${BASE_URL}/blogByid/${id}`
  );
};
 
// ✅ NEW — immediately delete a single already-saved gallery image from a content block
export const removeBlogBlockImageApi = (id: string, blockId: string, imagePath: string) => {
  return commonApi("POST", `${BASE_URL}/admin/blog/${id}/remove-block-image`, {
    blockId,
    imagePath,
  });
};
 
// ✅ NEW — dedicated publish / unpublish action
export const setBlogPublicationStatusApi = (
  id: string,
  publicationStatus: "draft" | "published"
) => {
  return commonApi("PATCH", `${BASE_URL}/admin/blog/${id}/publication-status`, {
    publicationStatus,
  });
};
 
// dedicated FAQ endpoint — used by the services table's quick-edit modal
export const updateBlogFaqsApi = (id: string, faqs: BlogFaqItem[]) =>
  commonApi<{ success: boolean; message: string; data: BlogFaqItem[] }>(
    "PATCH", `${BASE_URL}/admin/blogs/${id}/faqs`, { faqs }
  );

// bulk actions
export const bulkToggleBlogsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/admin/blogs/bulk-status`,
    { ids, isActive }
  );

export const bulkDeleteBlogsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/admin/blogs/bulk-delete`,
    { ids }
  );

/* ============================================================
   TESTIMONIALS
   ============================================================ */



// get all
export const getAlltestimonialsApi = () => {
  return commonApi<TestimonialApiResponse>("GET", `${BASE_URL}/get/testimonials`);
};

// status toggle
export const toggletestimonialApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/testimonial/${id}/toggle`);
};
// ✅ FormData — works with image upload + services array
export const add_testimonial_Api = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/testimonials`, data);

export const updatetestimonialApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/Updatetestimonial/${id}`, data);

// delete
export const deletetestimonialApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/testimonial/delete/${id}`);
};

export const getTestimonialbyIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: TestimonialResponse }>(
    "GET",
    `${BASE_URL}/testimonialByid/${id}`
  );
};

// bulk actions
export const bulkToggleTestimonialsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/admin/testimonials/bulk-status`,
    { ids, isActive }
  );

export const bulkDeleteTestimonialsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/admin/testimonials/bulk-delete`,
    { ids }
  );

/* ============================================================
   BANNERS
   ============================================================ */

// add
export const add_banner_Api = async (reqBody: unknown) => {
  return await commonApi("POST", `${BASE_URL}/banner`, reqBody);
};

// get all
export const getAllbannersApi = () => {
  return commonApi<BannerApiResponse>("GET", `${BASE_URL}/get/banners`);
};

// status toggle
export const togglebannerApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/banner/${id}/toggle`);
};

// update
export const updatebannerApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/Updatebanner/${id}`, data);
};

// delete
export const deletebannerApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/banner/delete/${id}`);
};

export const getbannerbyIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: BannerResponse }>(
    "GET",
    `${BASE_URL}/bannerByid/${id}`
  );
};

// bulk actions
export const bulkToggleBannersApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/admin/banners/bulk-status`,
    { ids, isActive }
  );

export const bulkDeleteBannersApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/admin/banners/bulk-delete`,
    { ids }
  );

  export const updateBannerOrderApi = (updates: { id: string; displayOrder: number }[]) =>
  commonApi<{ success: boolean; message: string }>(
    "PATCH",
    `${BASE_URL}/admin/banners/order`,
    updates
  );

/* ============================================================
   AUTHORS
   ============================================================ */

// add
export const add_author_Api = async (reqBody: unknown) => {
  return await commonApi("POST", `${BASE_URL}/author`, reqBody);
};

// get all
export const getAllauthorsApi = () => {
  return commonApi<AuthorApiResponse>("GET", `${BASE_URL}/get/authors`);
};

// status toggle
export const toggleAuthorApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/author/${id}/toggle`);
};

// update
export const updateAuthorApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/updateAuthor/${id}`, data);
};

// delete
export const deleteAuthorApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/author/delete/${id}`);
};

export const getAuthorByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: AuthorResponse }>(
    "GET",
    `${BASE_URL}/authorByid/${id}`
  );
};

// bulk actions
export const bulkToggleAuthorsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/admin/authors/bulk-status`,
    { ids, isActive }
  );

export const bulkDeleteAuthorsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/admin/authors/bulk-delete`,
    { ids }
  );

/* ============================================================
   PERMISSIONS
   ============================================================ */

export const getPermissionModulesApi = () =>
  commonApi<ModulesResponse>("GET", `${BASE_URL}/admin/permissions/modules`);

export const getPermissionsByRoleApi = (role: "admin" | "staff") =>
  commonApi<PermissionResponse>("GET", `${BASE_URL}/admin/permissions/${role}`);

export const updatePermissionsByRoleApi = (
  role: "admin" | "staff",
  permissions: ModulePermission[]
) => commonApi<PermissionResponse>("PUT", `${BASE_URL}/admin/permissions/${role}`, { permissions });

// permission checker
export const checkAdminPermissionAuthApi = () =>
  commonApi<AuthCheckResponse>("GET", `${BASE_URL}/admin/permission/me`);

/* ============================================================
   CONTACT ENQUIRIES
   ============================================================ */

export const getAllcontactusApi = () => {
  return commonApi<EnquiryApiResponse>("GET", `${BASE_URL}/admin/contactsus`);
};

export const deleteEnquiriesApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/contacts/delete/${id}`);
};

export const getEnquiryByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: EnquiryResponse }>(
    "GET",
    `${BASE_URL}/enquiryByid/${id}`
  );
};

export const bulkDeleteEnquiriesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/contacts/bulk-delete`,
    { ids }
  );

/* ============================================================
   CAREERS (APPLICATIONS)
   ============================================================ */

// list all applications (admin)
export const getAllCareersApi = () => {
  return commonApi<CareerApiResponse>("GET", `${BASE_URL}/careers`);
};

// single application (admin) — also marks it as read on the backend
export const getCareerByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: CareerResponse }>(
    "GET",
    `${BASE_URL}/careers/${id}`
  );
};

// update workflow status (admin)
export const updateCareerStatusApi = (id: string, status: CareerStatus, reason: string) => {
  return commonApi<{ success: boolean; data: CareerResponse }>(
    "PATCH",
    `${BASE_URL}/careers/${id}/status`,
    { status, reason }
  );
};

// delete application (admin)
export const deleteCareerApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/careers/${id}`);
};

// bulk actions
export const bulkDeleteCareersApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/careers/bulk-delete`,
    { ids }
  );

/* ============================================================
   JOBS (POSTINGS)
   ============================================================ */

export const getActiveJobsApi = () =>
  commonApi<{ success: boolean; data: JobResponse[] }>("GET", `${BASE_URL}/jobs/active`);

export const getAllJobsApi = () =>
  commonApi<{ success: boolean; data: JobResponse[] }>("GET", `${BASE_URL}/admin/jobs`);


export const getAllJobsfilterApi = () =>
  commonApi<{ success: boolean; data: JobResponse[] }>("GET", `${BASE_URL}/jobs/filter`);


export const getJobByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: JobResponse }>("GET", `${BASE_URL}/admin/jobs/${id}`);

export const addJobApi = (body: Partial<JobResponse>) =>
  commonApi("POST", `${BASE_URL}/jobs`, body);

export const updateJobApi = (id: string, body: Partial<JobResponse>) =>
  commonApi("PUT", `${BASE_URL}/jobs/${id}`, body);

export const toggleJobApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/jobs/${id}/toggle`);

export const deleteJobApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/jobs/${id}`);

// bulk actions
export const bulkToggleJobsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH",
    `${BASE_URL}/jobs/bulk-status`,
    { ids, isActive }
  );

export const bulkDeleteJobsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST",
    `${BASE_URL}/jobs/bulk-delete`,
    { ids }
  );

  /* ============================================================
   Technology (POSTINGS)
   ============================================================ */
   export const updateTechnologyOrderApi = (updates: { id: string; displayOrder: number }[]) =>
  commonApi<{ success: boolean; message: string }>(
    "PATCH",
    `${BASE_URL}/admin/technologies/order`,
    updates
  );

export const addTechnologyApi = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/admin/technologies`, data);
 
export const getAllTechnologiesApi = () =>
  commonApi<{ success: boolean; data: TechnologyResponse[] }>(
    "GET", `${BASE_URL}/admin/technologies`
  );
 
export const getTechnologyByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: TechnologyResponse }>(
    "GET", `${BASE_URL}/admin/technologies/${id}`
  );
 
export const updateTechnologyApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/technologies/${id}`, data);
 
export const toggleTechnologyApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/technologies/${id}/toggle`);
 
export const deleteTechnologyApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/technologies/${id}`);
 
export const bulkToggleTechnologiesApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/technologies/bulk-status`, { ids, isActive }
  );
 
export const bulkDeleteTechnologiesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/technologies/bulk-delete`, { ids }
  );

  /* ============================================================
   SERVICES
   ============================================================ */
/* ============================================================
   SERVICE APIs
============================================================ */


export const addServiceApi = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/admin/services`, data);

export const getAllServicesApi = (params?: { topLevelOnly?: boolean; parentService?: string }) => {
  const query = new URLSearchParams();
  if (params?.topLevelOnly) query.set("topLevelOnly", "true");
  if (params?.parentService) query.set("parentService", params.parentService);
  const qs = query.toString();
  return commonApi<{ success: boolean; data: ServiceResponse[] }>(
    "GET", `${BASE_URL}/admin/services${qs ? `?${qs}` : ""}`
  );
};

export const getServiceByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: ServiceResponse }>(
    "GET", `${BASE_URL}/admin/services/${id}`
  );

export const getServiceRelationsApi = (id: string) =>
  commonApi<{ success: boolean; data: ServiceRelations }>(
    "GET", `${BASE_URL}/admin/services/${id}/relations`
  );

export const updateServiceApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/services/${id}`, data);

// dedicated FAQ endpoint — used by the services table's quick-edit modal
export const updateServiceFaqsApi = (id: string, faqs: ServiceFaqItem[]) =>
  commonApi<{ success: boolean; message: string; data: ServiceFaqItem[] }>(
    "PATCH", `${BASE_URL}/admin/services/${id}/faqs`, { faqs }
  );

export const toggleServiceApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/services/${id}/toggle`);

export const deleteServiceApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/services/${id}`);

export const bulkToggleServicesApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/services/bulk-status`, { ids, isActive }
  );

export const bulkDeleteServicesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/services/bulk-delete`, { ids }
  );
/* ============================================================
   INDUSTRIES
   ============================================================ */
export const addIndustryApi = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/admin/industries`, data);

export const getAllIndustriesApi = () =>
  commonApi<{ success: boolean; data: IndustryResponse[] }>(
    "GET", `${BASE_URL}/admin/industries`
  );

export const getIndustryByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: IndustryResponse }>(
    "GET", `${BASE_URL}/admin/industries/${id}`
  );

export const updateIndustryApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/industries/${id}`, data);

export const toggleIndustryApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/industries/${id}/toggle`);

export const deleteIndustryApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/industries/${id}`);

export const bulkToggleIndustriesApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/industries/bulk-status`, { ids, isActive }
  );

export const bulkDeleteIndustriesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/industries/bulk-delete`, { ids }
  );


/* ============================================================
   SOLUTION APIs
============================================================ */


export const add_solution_Api = (data: FormData) => {
  return commonApi("POST", `${BASE_URL}/solutions`, data);
};

export const getAllSolutionsApi = () => {
  return commonApi<SolutionApiResponse>("GET", `${BASE_URL}/get/solutions`);
};

export const getSolutionByIdApi = (id: string) => {
  return commonApi<{ success: boolean; data: SolutionResponse }>(
    "GET",
    `${BASE_URL}/solutionById/${id}`
  );
};

export const updateSolutionApi = (id: string, data: FormData) => {
  return commonApi("PUT", `${BASE_URL}/admin/updateSolution/${id}`, data);
};

export const toggleSolutionApi = (id: string) => {
  return commonApi("PUT", `${BASE_URL}/admin/solution/${id}/toggle`);
};

export const deleteSolutionApi = (id: string) => {
  return commonApi("DELETE", `${BASE_URL}/admin/solution/delete/${id}`);
};
  
export const bulkToggleSolutionsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/solutions/bulk-status`, { ids, isActive }
  );

export const bulkDeleteSolutionsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/solutions/bulk-delete`, { ids }
  );
// ============================================================
// services/allAPi.ts — ADD CaseStudy APIs
// ============================================================

 
export const addCaseStudyApi = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/admin/case-studies`, data);
 
export const getAllCaseStudiesApi = () =>
  commonApi<{ success: boolean; data: Partial<CaseStudyResponse>[] }>(
    "GET", `${BASE_URL}/admin/case-studies`
  );
 
export const getCaseStudyByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: CaseStudyResponse }>(
    "GET", `${BASE_URL}/admin/case-studies/${id}`
  );
 
export const updateCaseStudyApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/case-studies/${id}`, data);
 
export const toggleCaseStudyApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/case-studies/${id}/toggle`);
 
export const deleteCaseStudyApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/case-studies/${id}`);
 
export const removeGalleryImageApi = (id: string, imagePath: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/case-studies/${id}/gallery`, { imagePath });
 
export const bulkToggleCaseStudiesApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/case-studies/bulk-status`, { ids, isActive }
  );
 
export const bulkDeleteCaseStudiesApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/case-studies/bulk-delete`, { ids }
  );

export const updateCaseStudyOrderApi = (
  updates: { id: string; displayOrder: number }[]
) =>
  commonApi<{ success: boolean; message: string }>(
    "PATCH",
    `${BASE_URL}/admin/case-studies/order`,
    updates
  );



  // ============================================================
// client api
// ============================================================

  export const addClientApi = (data: FormData) =>
  commonApi("POST", `${BASE_URL}/admin/clients`, data);

export const getAllClientsApi = () =>
  commonApi<{ success: boolean; data: ClientResponse[] }>(
    "GET", `${BASE_URL}/admin/clients`
  );

export const getClientByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: ClientResponse }>(
    "GET", `${BASE_URL}/admin/clients/${id}`
  );

export const updateClientApi = (id: string, data: FormData) =>
  commonApi("PUT", `${BASE_URL}/admin/clients/${id}`, data);

export const toggleClientApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/clients/${id}/toggle`);

export const deleteClientApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/clients/${id}`);

export const bulkToggleClientsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/clients/bulk-status`, { ids, isActive }
  );

export const bulkDeleteClientsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/clients/bulk-delete`, { ids }
  );


  /* ============================================================
   FAQ APIs
============================================================ */


export const addFaqApi = (data: { question: string; answer: string; status: boolean }) =>
  commonApi("POST", `${BASE_URL}/admin/faqs`, data);

export const getAllFaqsApi = () =>
  commonApi<{ success: boolean; data: FaqResponse[] }>(
    "GET", `${BASE_URL}/admin/faqs`
  );

  export const updateFaqOrderApi = (
  updates: { id: string; displayOrder: number }[]
) =>
  commonApi<{ success: boolean; message: string }>(
    "PATCH", `${BASE_URL}/admin/faqs/order`, updates
  );

export const getFaqByIdApi = (id: string) =>
  commonApi<{ success: boolean; data: FaqResponse }>(
    "GET", `${BASE_URL}/admin/faqs/${id}`
  );

export const updateFaqApi = (id: string, data: { question?: string; answer?: string; displayOrder?: number; status?: boolean }) =>
  commonApi("PUT", `${BASE_URL}/admin/faqs/${id}`, data);

export const toggleFaqApi = (id: string) =>
  commonApi("PATCH", `${BASE_URL}/admin/faqs/${id}/toggle`);

export const deleteFaqApi = (id: string) =>
  commonApi("DELETE", `${BASE_URL}/admin/faqs/${id}`);

export const bulkToggleFaqsApi = (ids: string[], isActive: boolean) =>
  commonApi<{ success: boolean; message: string; modified: number }>(
    "PATCH", `${BASE_URL}/admin/faqs/bulk-status`, { ids, isActive }
  );

export const bulkDeleteFaqsApi = (ids: string[]) =>
  commonApi<{ success: boolean; message: string; deleted: number }>(
    "POST", `${BASE_URL}/admin/faqs/bulk-delete`, { ids }
  );