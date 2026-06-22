import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const endpoint = 'https://api.github.com/graphql';
const token = process.env.GITHUB_ACCESS_TOKEN;

if (!token) {
  console.error('GITHUB_ACCESS_TOKEN is required');
  process.exit(1);
}

const query = `
  query summary {
    user(login: "rkkautsar") {
      url
      name
      bio
      company
      location
      avatarUrl
      pinnedItems(first: 4) {
        edges {
          node {
            ... on Repository {
              name
              url
              description
              updatedAt
            }
          }
        }
      }
    }
  }
`;

async function main() {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    console.error('GitHub API error:', res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const outPath = resolve(__dirname, '..', 'src', 'data', 'github.json');
  writeFileSync(outPath, JSON.stringify(data.data, null, 2));
  console.log('Wrote', outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
