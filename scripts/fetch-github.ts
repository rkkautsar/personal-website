import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const endpoint = 'https://api.github.com/graphql';
const token = process.env.GITHUB_ACCESS_TOKEN;

function normalizeHomepageUrl(value: string | null) {
  const url = value?.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`;
}

const profileQuery = `
  query summary {
    user(login: "rkkautsar") {
      url
      name
      bio
      company
      location
      avatarUrl
      pinnedItems(first: 6) {
        edges {
          node {
            ... on Repository {
              name
              url
              description
              homepageUrl
              updatedAt
            }
          }
        }
      }
    }
  }
`;

async function main() {
  if (!token) {
    throw new Error('GITHUB_ACCESS_TOKEN is required to refresh profile data');
  }

  async function graphql<T>(query: string): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'rakha-personal-website-build',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API returned ${response.status}: ${await response.text()}`
      );
    }

    const result = (await response.json()) as {
      data?: T;
      errors?: Array<{ message: string }>;
    };
    if (result.errors?.length || !result.data) {
      throw new Error(
        `GitHub GraphQL failed: ${result.errors?.map((error) => error.message).join('; ')}`
      );
    }
    return result.data;
  }

  const data = await graphql<{
    user: {
      url: string;
      name: string;
      bio: string | null;
      company: string | null;
      location: string | null;
      avatarUrl: string;
      pinnedItems: {
        edges: Array<{
          node: {
            name: string;
            url: string;
            description: string | null;
            homepageUrl: string | null;
            updatedAt: string;
          };
        }>;
      };
    };
  }>(profileQuery);

  data.user.pinnedItems.edges.forEach(({ node }) => {
    node.homepageUrl = normalizeHomepageUrl(node.homepageUrl);
  });

  const output = JSON.stringify(data, null, 2);
  const publicDirectory = resolve('public/data');
  mkdirSync(publicDirectory, { recursive: true });
  writeFileSync(resolve(publicDirectory, 'github.json'), `${output}\n`);
  writeFileSync(resolve('src/data/github-profile.json'), `${output}\n`);
  console.log(
    'Fetched the current GitHub GraphQL profile and pinned repository metadata.'
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
