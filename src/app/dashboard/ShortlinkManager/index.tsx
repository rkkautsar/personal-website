import { SearchLinks } from '@/app/dashboard/ShortlinkManager/Search';
import { EditLink } from '@/app/dashboard/ShortlinkManager/Edit';

export function ShortlinkManager() {
  return (
    <div className="w-full max-w-[640px] mx-auto">
      <div className="py-2">
        <h2 className="mb-2">Add/Edit links</h2>
        <EditLink />
      </div>

      <div className="py-2">
        <h2>Search links</h2>
        <SearchLinks />
      </div>
    </div>
  );
}
