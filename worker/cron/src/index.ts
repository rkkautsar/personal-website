interface Env {
  CF_API_TOKEN: string;
  GITHUB_ACCESS_TOKEN: string;
}

interface RepositorySnapshot {
  name: string;
  url: string;
  description: string | null;
  homepageUrl: string | null;
  updatedAt: string;
}

interface ProfileSnapshot {
  user: {
    url: string;
    name: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    avatarUrl: string;
    pinnedItems: { edges: Array<{ node: RepositorySnapshot }> };
  };
}

const accountId = '3d2c7278332e1314ee55afa8743dd6bc';
const projectName = 'personal-website';
const publishedSnapshotUrl = 'https://rakha.dev/data/github.json';

const query = `
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

function normalizeHomepageUrl(value: string | null) {
  const url = value?.trim();
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url.replace(/^\/+/, '')}`;
}

function comparableProfile(data: ProfileSnapshot) {
  const user = data.user;
  return {
    url: user.url,
    name: user.name,
    bio: user.bio ?? null,
    company: user.company ?? null,
    location: user.location ?? null,
    avatarUrl: user.avatarUrl,
    pinnedItems: {
      edges: user.pinnedItems.edges.map(({ node }) => ({
        name: node.name,
        url: node.url,
        description: node.description ?? null,
        homepageUrl: normalizeHomepageUrl(node.homepageUrl),
        updatedAt: node.updatedAt,
      })),
    },
  };
}

async function getCurrentProfile(token: string): Promise<ProfileSnapshot> {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'rakha-personal-website-refresh-check',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API returned ${response.status}: ${await response.text()}`
    );
  }

  const result = (await response.json()) as {
    data?: ProfileSnapshot;
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length || !result.data?.user) {
    throw new Error(
      `GitHub GraphQL failed: ${result.errors?.map((error) => error.message).join('; ')}`
    );
  }

  return result.data;
}

async function getPublishedProfile(): Promise<ProfileSnapshot | null> {
  const response = await fetch(
    `${publishedSnapshotUrl}?refresh=${Date.now()}`,
    {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    }
  );
  if (!response.ok) return null;

  const data = (await response.json()) as ProfileSnapshot;
  return data.user?.pinnedItems ? data : null;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const current = await getCurrentProfile(env.GITHUB_ACCESS_TOKEN);
    const published = await getPublishedProfile();
    const githubChanged =
      !published ||
      JSON.stringify(comparableProfile(current)) !==
        JSON.stringify(comparableProfile(published));
    if (!githubChanged) {
      console.log(
        'Pinned GitHub profile is unchanged; skipping the Pages deployment.'
      );
      return;
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branch: 'master' }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to trigger Pages deployment: ${await response.text()}`
      );
    }

    console.log(
      `Pages deployment triggered. GitHub changed: ${githubChanged}.`
    );
  },
};
