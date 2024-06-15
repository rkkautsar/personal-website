import { Container, Heading } from '@radix-ui/themes';
import { SearchLinks } from '@/app/dashboard/ShortlinkManager/Search';
import { EditLink } from '@/app/dashboard/ShortlinkManager/Edit';

export function ShortlinkManager() {
  return (
    <Container width="100%" maxWidth="640px">
      <div className="py-2">
        <Heading className="mb-2">Add/Edit links</Heading>
        <EditLink />
      </div>

      <div className="py-2">
        <Heading>Search links</Heading>
        <SearchLinks />
      </div>
    </Container>
  );
}
