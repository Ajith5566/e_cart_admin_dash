export type ProductQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

//pages api types 

export type PageQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  inactive?:boolean;
};


//user api types
export type UserQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};
