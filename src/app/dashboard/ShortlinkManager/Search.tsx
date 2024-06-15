'use client';

import { Button, Table, TextField } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { findShortLink, remLink, ShortLink } from '@/services/redis/shortlink';
import { debounce } from 'next/dist/server/utils';
import { router } from 'next/client';
import { useRouter } from 'next/navigation';

export function SearchLinks() {
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<ShortLink[]>([]);
  const router = useRouter();

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
          <TextField.Root
            placeholder="Search links..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <Button type="submit">Search</Button>
        </div>
      </form>
      {links.length > 0 ? (
        <Table.Root layout="auto">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Path</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell maxWidth="200px">
                Link
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Action</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {links.map((link) => (
              <Table.Row key={link.path}>
                <Table.Cell>
                  <a href={`/l${link.path}`}>{link.path}</a>
                </Table.Cell>
                <Table.Cell maxWidth="200px">
                  <a href={link.redirect}>{link.redirect}</a>
                </Table.Cell>
                <Table.Cell>
                  <Button onClick={() => handleDelete(link.path)}>
                    Delete
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      ) : null}
    </div>
  );
}
