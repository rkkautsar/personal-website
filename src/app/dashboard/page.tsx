import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShortlinkManager } from '@/app/dashboard/ShortlinkManager';

export default async function DashboardPage() {
  return (
    <Tabs defaultValue="shortlinks">
      <div className="flex justify-center">
        <TabsList defaultValue="shortlinks">
          <TabsTrigger value="shortlinks">Short links</TabsTrigger>
          <TabsTrigger value="#">TBD</TabsTrigger>
        </TabsList>
      </div>
      <div className="pt-3">
        <TabsContent value="shortlinks" className="p-4">
          <ShortlinkManager />
        </TabsContent>
      </div>
    </Tabs>
  );
}
