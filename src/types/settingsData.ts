type BannerType = "image" | "video" | "none";

export type SettingsData = {
  email:             string;
  phone:             string;
  address:           string;
  facebook:          string;
  twitter:           string;
  linkedin:          string;
  instagram:         string;
  youtube:           string;
  yearsOfExperience: string;
  projectsCompleted: string;
  clientSatisfaction:string;
  expertTeamMembers: string;
  countriesServed:   string;
  bannerType:        BannerType;
  bannerImage:       string;
  bannerVideoUrl:    string;
};