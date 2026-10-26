import { ArrowUpRight } from 'lucide-react';

export function ContactSection() {
  return (
    <section className="content-section contact-section" id="contact">
      <p className="section-label">05 / Contact</p>
      <h2>Let’s make something useful.</h2>
      <p className="section-intro">For thoughtful product and engineering work, I’m happy to talk.</p>
      <a className="contact-email" href="mailto:rkkautsar@gmail.com">rkkautsar@gmail.com</a>
      <div className="social-links">
        <a href="/l/linkedin">LinkedIn <ArrowUpRight aria-hidden="true" size={13} /></a>
        <a href="/l/github">GitHub <ArrowUpRight aria-hidden="true" size={13} /></a>
        <a href="/l/x">X <ArrowUpRight aria-hidden="true" size={13} /></a>
        <a href="/l/instagram">Instagram <ArrowUpRight aria-hidden="true" size={13} /></a>
      </div>
    </section>
  );
}
