import { ArrowUpRight } from 'lucide-react';
import { SectionNav } from '@/components/SectionNav';

export function ProfileRail({ name }: { name: string }) {
  return (
    <aside className="profile-rail">
      <div className="profile-intro">
        <a className="wordmark" href="#about" aria-label="Back to the top">
          RK<span>.</span>
        </a>
        <p className="eyebrow">Frontend &amp; product engineering</p>
        <h1>{name}</h1>
        <p className="profile-summary">Singapore · React · React Native · Go</p>
      </div>

      <SectionNav />

      <div className="rail-links">
        <a href="/l/resume">Résumé <ArrowUpRight aria-hidden="true" size={14} /></a>
        <a href="mailto:rkkautsar@gmail.com">Email <ArrowUpRight aria-hidden="true" size={14} /></a>
      </div>
    </aside>
  );
}
