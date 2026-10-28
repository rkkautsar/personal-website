import { posts as articles } from '@/blog/metadata';
export const posts = articles.map(({ title, description, date, slug }) => ({ title, description, date, url: `/blog/${slug}/` }));
