import type { Dayjs } from "dayjs";

export type SocialObjects = {
  name: SocialMedia;
  href: string;
  active: boolean;
  linkTitle: string;
}[];

export type Post = {
  postId: string;
  postSlug: string;
  title: string;
  date: Dayjs;
  formatedDate: string;
  tags: string[];
  draft: boolean;
  description?: string;
};

export type Posts = Post[];

export type MainPage = {
  posts: Posts;
  currentPage: number;
  maxPage: number;
}

export type SocialIcons = {
  [social in SocialMedia]: string;
};

export type SocialMedia =
  | "Github"
  | "Facebook"
  | "Instagram"
  | "LinkedIn"
  | "Mail"
  | "Twitter"
  | "Twitch"
  | "YouTube"
  | "WhatsApp"
  | "Snapchat"
  | "Pinterest"
  | "TikTok"
  | "CodePen"
  | "Discord"
  | "GitLab"
  | "Reddit"
  | "Skype"
  | "Steam"
  | "Telegram"
  | "Mastodon";