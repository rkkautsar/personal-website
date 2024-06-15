import { Box, Tabs, Heading } from '@radix-ui/themes';
import { ShortlinkManager } from '@/app/dashboard/ShortlinkManager';

export default async function DashboardPage() {
  return (
    <Tabs.Root defaultValue="shortlinks">
      <Tabs.List>
        <Tabs.Trigger value="shortlinks">Short links</Tabs.Trigger>
      </Tabs.List>
      <Box pt="3">
        <Tabs.Content value="shortlinks" className="p-4">
          <ShortlinkManager />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
