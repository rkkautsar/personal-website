import { adminFetch } from './api';
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

interface ShortLink {
  path: string;
  redirect: string;
}

async function fetchLinks(query: string): Promise<ShortLink[]> {
  const params = new URLSearchParams({ query });
  const res = await adminFetch(`/api/admin/links?${params}`);

  return res.json();
}

async function deleteLink(path: string) {
  await adminFetch(`/api/admin/links/${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
}

export function SearchLinks() {
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError('');
    try {
      const result = await fetchLinks(query);
      setLinks(result);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleDelete = async (path: string) => {
    setError('');
    try {
      await deleteLink(path);
      const result = await fetchLinks(query);
      setLinks(result);
    } catch (error) {
      setError((error as Error).message);
    }
  };

  return (
    <div>
      {error && <p role="alert">{error}</p>}
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
