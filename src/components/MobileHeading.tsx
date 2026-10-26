import { ArrowUpRight } from 'lucide-react';

export function MobileHeading({ name }: { name: string }) {
  return (
    <div className="mobile-heading">
      <div className="mobile-identity">
        <a className="wordmark" href="#about" aria-label="Back to the top">
          RK<span>.</span>
        </a>
        <h1 className="mobile-name">{name}</h1>
      </div>
      <a href="/l/resume" className="mobile-resume-link">
        Résumé <ArrowUpRight aria-hidden="true" size={14} />
      </a>
    </div>
  );
}
