

export type BannerTypes = {

  title: string;
  sub_title: string;
   button_text:string;
  url: string;
  status: boolean;
   banner_image: File | null;
 mobile_image: File | null;
};
export type BannerResponse = {
  _id: string;
  title: string;
   sub_title: string;
   button_text:string;
  url: string;
  isActive: boolean;
  banner_image:string;
 mobile_image: string;
};
export type BannerApiResponse = {
  success: boolean;
  count: number;
  data: BannerResponse[];
};
