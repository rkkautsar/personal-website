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
const publishedHashnodeUrl = 'https://rakha.dev/data/hashnode.json';
const hashnodeFeedUrl = 'https://blog.rakha.dev/rss.xml';

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
    throw new Error(`GitHub API returned ${response.status}: ${await response.text()}`);
  }

  const result = (await response.json()) as {
    data?: ProfileSnapshot;
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length || !result.data?.user) {
    throw new Error(`GitHub GraphQL failed: ${result.errors?.map((error) => error.message).join('; ')}`);
  }

  return result.data;
}

async function getPublishedProfile(): Promise<ProfileSnapshot | null> {
  const response = await fetch(`${publishedSnapshotUrl}?refresh=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) return null;

  const data = (await response.json()) as ProfileSnapshot;
  return data.user?.pinnedItems ? data : null;
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function readXmlTag(xml: string, tag: string) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1] ? decodeXml(match[1].trim()) : '';
}

function toPlainText(value: string) {
  return decodeXml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

async function getCurrentHashnodePosts() {
  const response = await fetch(hashnodeFeedUrl, {
    cache: 'no-store',
    headers: {
      accept: 'application/rss+xml, application/xml, text/xml',
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) throw new Error(`Hashnode RSS feed returned ${response.status}.`);

  const xml = await response.text();
  if (!/<rss\b/i.test(xml)) throw new Error('Hashnode did not return an RSS feed.');

  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)]
    .flatMap(([_, item]) => {
      const title = toPlainText(readXmlTag(item, 'title'));
      const url = readXmlTag(item, 'link') || readXmlTag(item, 'guid');
      const timestamp = Date.parse(readXmlTag(item, 'pubDate'));
      if (!title || !url || !Number.isFinite(timestamp)) return [];
      return [{
        title,
        url: new URL(url, hashnodeFeedUrl).href,
        date: new Date(timestamp).toISOString().slice(0, 10),
        description: toPlainText(readXmlTag(item, 'description')),
      }];
    })
    .sort((left, right) => right.date.localeCompare(left.date));
}

async function getPublishedHashnodePosts() {
  const response = await fetch(`${publishedHashnodeUrl}?refresh=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { posts?: Array<{ title: string; url?: string; date: string; description: string }> };
  return Array.isArray(data.posts) ? data.posts : null;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env): Promise<void> {
    const current = await getCurrentProfile(env.GITHUB_ACCESS_TOKEN);
    const published = await getPublishedProfile();
    const currentPosts = await getCurrentHashnodePosts();
    const publishedPosts = await getPublishedHashnodePosts();
    const githubChanged =
      !published ||
      JSON.stringify(comparableProfile(current)) !== JSON.stringify(comparableProfile(published));
    const writingChanged =
      !publishedPosts ||
      JSON.stringify(currentPosts) !== JSON.stringify(publishedPosts.map(({ title, url, date, description }) => ({ title, url, date, description })));

    if (!githubChanged && !writingChanged) {
      console.log('Pinned GitHub profile and Hashnode posts are unchanged; skipping the Pages deployment.');
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
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to trigger Pages deployment: ${await response.text()}`);
    }

    console.log(`Pages deployment triggered. GitHub changed: ${githubChanged}; Hashnode writing changed: ${writingChanged}.`);
  },
};
