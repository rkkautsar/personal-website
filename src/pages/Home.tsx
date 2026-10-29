import { AboutSection } from '@/components/sections/AboutSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { WritingSection } from '@/components/sections/WritingSection';
import { MobileHeading } from '@/components/MobileHeading';
import { ProfileRail } from '@/components/ProfileRail';
import { SectionNav } from '@/components/SectionNav';
import { SiteFooter } from '@/components/SiteFooter';
import githubData from '@/data/github-profile.json';
import type { GithubProfile } from '@/types/github';

export default function Home() {
  const profile = githubData as GithubProfile;
  const user = profile.user;
  const projects = user.pinnedItems.edges
    .map(({ node }) => node)
    .filter((project) => project.url);

  return (
    <div className="site-shell">
      <ProfileRail name={user.name} />
      <main className="main-content">
        <MobileHeading name={user.name} />
        <SectionNav mobile />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection projects={projects} profileUrl={user.url} />
        <WritingSection />
        <ContactSection />
        <SiteFooter name={user.name} />
      </main>
    </div>
  );
}
