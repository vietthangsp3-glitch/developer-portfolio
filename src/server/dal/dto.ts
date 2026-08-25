import type { CaseStudyContent } from "@/features/projects/schemas/project";
import type { SocialLink } from "@/features/site-settings/schemas/site-settings";

export type PublicMediaDto = {
  url: string;
  width: number;
  height: number;
  format: string;
  altText: string;
};

export type PublicProjectSummaryDto = {
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  category: string;
  role: string;
  year: number;
  featured: boolean;
  thumbnail: PublicMediaDto | null;
  technologies: string[];
  liveUrl: string | null;
  repositoryUrl: string | null;
};

export type PublicProjectDetailDto = PublicProjectSummaryDto & {
  description: string | null;
  heroMedia: PublicMediaDto | null;
  media: Array<
    PublicMediaDto & {
      role: "cover" | "hero" | "gallery" | "case_study";
      caption: string | null;
    }
  >;
  caseStudyContent: CaseStudyContent;
  seo: {
    title: string | null;
    description: string | null;
  };
};

export type PublicServiceDto = {
  slug: string;
  title: string;
  summary: string;
  description: string;
};

export type PublicTestimonialDto = {
  personName: string;
  role: string;
  company: string;
  quote: string;
  avatar: PublicMediaDto | null;
};

export type PublicSiteSettingsDto = {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  availability: string;
  contactEmail: string;
  socialLinks: SocialLink[];
  seoTitle: string;
  seoDescription: string;
};
