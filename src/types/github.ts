export type Repository = {
  name: string;
  url: string;
  description: string | null;
  homepageUrl?: string | null;
  updatedAt: string;
};

export type GithubProfile = {
  user: {
    name: string;
    url: string;
    pinnedItems: { edges: Array<{ node: Repository }> };
  };
};
