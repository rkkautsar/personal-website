import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || '';
const API_SECRET = 'bbd4966f7647870920ac3e54662cad1805fb095190b0e447a808825b8995f472';

interface ShortLink {
  path: string;
  redirect: string;
}

async function fetchLinks(query: string): Promise<ShortLink[]> {
  const params = new URLSearchParams({ query });
  const res = await fetch(`${WORKER_URL}/api/links?${params}`);
  if (!res.ok) return [];
  return res.json();
}

async function deleteLink(path: string) {
  await fetch(`${WORKER_URL}/api/links/${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${API_SECRET}` },
  });
}

export function SearchLinks() {
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const result = await fetchLinks(query);
    setLinks(result);
  };

  const handleDelete = async (path: string) => {
    await deleteLink(path);
    const result = await fetchLinks(query);
    setLinks(result);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <div className="flex flex-row items-center gap-2 my-2">
          <div className="relative ml-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search links..."
              className="w-full rounded-lg bg-background pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>
      {links.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Path</TableHead>
              <TableHead className="max-w-[200px]">Link</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.path}>
                <TableCell>
                  <a href={`/l${link.path}`}>{link.path}</a>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <a href={link.redirect}>{link.redirect}</a>
                    </TooltipTrigger>
                    <TooltipContent>{link.redirect}</TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleDelete(link.path)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
