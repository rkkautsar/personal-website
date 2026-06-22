import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/dark-mode-toggle';
import data from '@/data/github.json';

const socials = [
  { name: 'linkedin', logo: 'logo-linkedin.svg' },
  { name: 'twitter', logo: 'logo-twitter.svg' },
  { name: 'instagram', logo: 'logo-instagram.svg' },
  { name: 'github', logo: 'logo-github.svg' },
];

export default function Home() {
  const user = data.user;

  return (
    <div className="p-10 space-y-10 max-w-screen-md mx-auto">
      <header className="space-y-2">
        <div className="relative">
          <ModeToggle className="absolute top-0 right-0" />
          <img
            src="https://github.com/rkkautsar.png"
            alt="@rkkautsar"
            className="rounded-full"
            width={80}
            height={80}
          />
        </div>
        <h1 className="leading-tight">{user.name}</h1>
        <p className="text-sm">
          {user.company}, {user.location}
        </p>
        <p className="text-ink-600">{user.bio}</p>
      </header>

      <section className="grid gap-2 md:grid-flow-col md:place-content-start">
        <Button asChild size="block">
          <a href="mailto:rkkautsar@gmail.com" className="md:w-48">
            Get in touch
          </a>
        </Button>
        <Button asChild variant="ghost" size="block" className="md:w-48">
          <a role="button" href="/l/resume">
            Resumé
          </a>
        </Button>
        <Button asChild variant="ghost" size="block" className="md:w-48">
          <a role="button" href="/l/blog">
            Writings
          </a>
        </Button>
      </section>

      <main>
        <h2 className="font-sans text-3xl font-bold mb-2">
          Highlighted Projects
        </h2>
        <div className="grid place-items-center md:grid-cols-2 gap-2">
          {user.pinnedItems.edges.map((item: any) => (
            <a
              key={item.node.url}
              href={item.node.url}
              className="card h-32 overflow-hidden"
              target="_blank"
              rel="noopener"
            >
              <h3>{item.node.name} &rarr;</h3>
              <p className="text-ink-600 truncate-3-lines">
                {item.node.description}
              </p>
            </a>
          ))}
        </div>

        <a
          role="button"
          className="btn btn-secondary mt-2"
          href={user.url}
        >
          More on GitHub
        </a>
      </main>

      <footer className="flex flex-col content-center text-center text-ink-700 gap-2">
        <section className="grid md:grid-flow-col place-content-center social mt-4">
          {socials.map((social) => (
            <a
              key={social.name}
              role="button"
              href={`/l/${social.name}`}
              className="btn btn-secondary"
            >
              {social.name}
            </a>
          ))}
        </section>

        <div>
          <a
            target="_blank"
            role="button"
            rel="noopener"
            className="font-mono hover:underline p-2"
            href="https://github.com/rkkautsar/personal-website"
          >
            &lt; view-source /&gt;
          </a>
        </div>
      </footer>
    </div>
  );
}
