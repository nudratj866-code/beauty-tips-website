export interface Comment {
  id: string;
  username: string;
  content: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readingTime: string;
  image: string;
  videoUrl?: string;
  likesCount: number;
  comments: Comment[];
  views?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  bio: string;
  skinType: string;
  hairType: string;
  avatar: string;
  isVerified: boolean;
  isAdmin: boolean;
  favorites: string[];
}

export type Category = 
  | "Skincare"
  | "Makeup"
  | "Hair Care"
  | "Nail Care"
  | "Natural Remedies"
  | "Beauty Products"
  | "Bridal Beauty"
  | "Wellness";

export const CATEGORIES: Category[] = [
  "Skincare",
  "Makeup",
  "Hair Care",
  "Nail Care",
  "Natural Remedies",
  "Beauty Products",
  "Bridal Beauty",
  "Wellness"
];
