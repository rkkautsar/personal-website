import { ArrowUpRight } from 'lucide-react';

export function AboutSection() {
  return (
    <section className="content-section about-section" id="about">
      <p className="section-label">01 / About</p>
      <p className="hero-copy">
        I’m a frontend engineer based in Singapore, with seven years building web and mobile software at Shopee, TikTok, and Hopper.
      </p>
      <p className="hero-copy">
        At Shopee, I cut shopping cart load time by 95%. At Hopper, I cut build times from 20 to 7 minutes and deployment times from 15 to 5, while building developer tools adopted across six travel portals.
      </p>
      <div className="hero-links">
        <a className="text-link" href="mailto:hello@rakha.dev">
          Get in touch <ArrowUpRight aria-hidden="true" size={15} />
        </a>
        <a className="text-link" href="/l/resume">
          View résumé <ArrowUpRight aria-hidden="true" size={15} />
        </a>
      </div>
    </section>
  );
}
