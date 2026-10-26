import postData from '@/data/posts.json';

export type PostSummary = {
  title: string;
  description: string;
  date: string;
  url: string;
};

export const posts = postData.posts as PostSummary[];
