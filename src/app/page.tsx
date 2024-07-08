import * as React from 'react';
import { requestSummary } from '@/services/github';
import Image from 'next/image';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/dark-mode-toggle';

let _data: { github: any } | null = null;

async function getData() {
  if (_data) {
    return _data;
  }
  try {
    // GraphQL
    const github = await requestSummary();
    _data = {
      github,
    };
    return _data;
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData();
  if (!data) return {};
  return {
    title: data.github.user.name,
    description: data.github.user.bio,
  };
}

const socials = [
  {
    name: 'linkedin',
    logo: 'logo-linkedin.svg',
  },
  {
    name: 'twitter',
    logo: 'logo-twitter.svg',
  },
  {
    name: 'instagram',
    logo: 'logo-instagram.svg',
  },
  {
    name: 'github',
    logo: 'logo-github.svg',
  },
];

export default async function HomePage() {
  const data = await getData();
  if (!data) return null;

  return (
    <div className="p-10 space-y-10 max-w-screen-md mx-auto">
      <header className="space-y-2">
        <div className="relative">
          <ModeToggle className="absolute top-0 right-0" />
          <Image
            src="https://github.com/rkkautsar.png"
            alt="@rkkautsar"
            className="rounded-full"
            width={80}
            height={80}
            priority
          />
        </div>
        <h1 className="leading-tight">{data.github.user.name}</h1>
        <p className="text-sm">
          {data.github.user.company}, {data.github.user.location}
        </p>
        <p className="text-ink-600">{data.github.user.bio}</p>
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
          {data.github.user.pinnedItems.edges.map((item: any) => (
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
          href={data.github.user.url}
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
              data-splitbee-event="External Link"
              data-splitbee-event-type={social.name}
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
