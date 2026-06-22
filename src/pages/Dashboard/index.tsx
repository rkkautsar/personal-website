import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchLinks } from './Search';
import { EditLink } from './Edit';
import { ModeToggle } from '@/components/ui/dark-mode-toggle';

export default function Dashboard() {
  return (
    <div>
      <header className="flex flex-row justify-between p-4">
        <div className="flex flex-row items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4" />
            </Link>
          </Button>
          <h3>Dashboard</h3>
        </div>
        <ModeToggle />
      </header>
      <Tabs defaultValue="shortlinks">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="shortlinks">Short links</TabsTrigger>
            <TabsTrigger value="tbd" disabled>
              TBD
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="pt-3">
          <TabsContent value="shortlinks" className="p-4">
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
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
