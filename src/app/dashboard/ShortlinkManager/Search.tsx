'use client';

import { useEffect, useMemo, useState } from 'react';
import { findShortLink, remLink, ShortLink } from '@/services/redis/shortlink';
import { debounce } from 'next/dist/server/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SearchLinks() {
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);

  const debouncedSearch = useMemo(
    () =>
      debounce(
        (q: string) =>
          findShortLink(q).then((links) => {
            setLinks(links);
          }),
        300
      ),
    []
  );
  useEffect(() => {
    debouncedSearch(query);
  }, [debouncedSearch, query]);
  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const links = await findShortLink(query);
    setLinks(links);
  };
  const handleDelete = async (path: string) => {
    await remLink(path);
    void handleSearch();
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
      {links.length > 0 ? (
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
      ) : null}
    </div>
  );
}
