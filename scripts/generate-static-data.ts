import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type PostSummary = {
  title: string;
  description: string;
  date: string;
  url: string;
};

const root = process.cwd();
const defaultHashnodeFeedUrl = 'https://blog.rakha.dev/rss.xml';

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

function readTag(xml: string, tag: string) {
  const escapedTag = tag.replace(':', '\\:');
  const match = xml.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
  return match?.[1] ? decodeXml(match[1].trim()) : '';
}

function plainText(value: string) {
  return decodeXml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

async function fetchHashnodePosts(): Promise<PostSummary[]> {
  const feedUrl = process.env.HASHNODE_RSS_URL || defaultHashnodeFeedUrl;

  const parsedUrl = new URL(feedUrl);
  if (parsedUrl.protocol !== 'https:') {
    throw new Error('HASHNODE_RSS_URL must use HTTPS.');
  }

  const response = await fetch(parsedUrl, {
    cache: 'no-store',
    headers: {
      accept: 'application/rss+xml, application/xml, text/xml',
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error(`Hashnode RSS feed returned ${response.status}.`);
  }

  const xml = await response.text();
  const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  if (!/<rss\b|<feed\b/i.test(xml)) {
    throw new Error('HASHNODE_RSS_URL did not return an RSS or Atom feed.');
  }

  return items.flatMap(([_, item]): PostSummary[] => {
    const title = plainText(readTag(item, 'title'));
    const url = readTag(item, 'link') || readTag(item, 'guid');
    const dateValue = readTag(item, 'pubDate') || readTag(item, 'dc:date') || readTag(item, 'published');
    const timestamp = Date.parse(dateValue);
    if (!title || !url || !Number.isFinite(timestamp)) return [];

    const description = plainText(readTag(item, 'description') || readTag(item, 'summary'));
    const postUrl = new URL(url, parsedUrl);
    return [{
      title,
      description,
      date: new Date(timestamp).toISOString().slice(0, 10),
      url: postUrl.href,
    }];
  }).sort((left, right) => right.date.localeCompare(left.date));
}

async function buildPostIndex() {
  const hashnodePosts = await fetchHashnodePosts();
  const dataDirectory = resolve(root, 'src/data');
  mkdirSync(dataDirectory, { recursive: true });
  writePostData(hashnodePosts);
  console.log(`Fetched ${hashnodePosts.length} recent Hashnode posts from RSS.`);
}

function writePostData(hashnodePosts: PostSummary[]) {
  writeFileSync(resolve(root, 'src/data/posts.json'), `${JSON.stringify({ posts: hashnodePosts }, null, 2)}\n`);
  // The cron Worker compares this public build snapshot with the current RSS feed.
  writeFileSync(resolve(root, 'public/data/hashnode.json'), `${JSON.stringify({ posts: hashnodePosts }, null, 2)}\n`);
}

async function prepareStaticData() {
  const publicDataDirectory = resolve(root, 'public/data');
  mkdirSync(publicDataDirectory, { recursive: true });
  await buildPostIndex();
}

prepareStaticData().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
