import { ArrowUpRight } from 'lucide-react';
import { experience } from '@/data/experience';

export function ExperienceSection() {
  return (
    <section className="content-section" id="experience">
      <div className="section-heading">
        <p className="section-label">02 / Experience</p>
        <h2>Experience</h2>
      </div>
      {experience.map((role) => (
        <article className="experience-item" key={role.company}>
          <p className="experience-period">{role.period}</p>
          <div>
            <h3>{role.company}</h3>
            <p className="experience-company">{role.role}</p>
            <p className="experience-description">{role.description}</p>
          </div>
        </article>
      ))}
      <a className="text-link experience-resume" href="/l/resume">
        Full résumé <ArrowUpRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
}
