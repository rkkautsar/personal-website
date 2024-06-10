import * as React from 'react';
import Head from 'next/head';
import { requestSummary } from '@/lib/services/github';
import Image from "next/image";

async function getData() {
  try {
    // GraphQL
    const github = await requestSummary();
    return {
      github
    };
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
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

export default async function Page() {
  const data = await getData()
  if (!data) return null;

  return (
    <div className="p-10 space-y-10 max-w-screen-md mx-auto">
      <Head>
        <title>{data.github.user.name}</title>
      </Head>

      <header className="space-y-2">
        <Image
          className="rounded-full w-20"
          src={data.github.user.avatarUrl}
          alt="Rakha's avatar"
          width={80}
          height={80}
        />
        <h1 className="leading-tight">{data.github.user.name}</h1>
        <p className="text-sm">
          {data.github.user.company}, {data.github.user.location}
        </p>
        <p className="text-ink-600">{data.github.user.bio}</p>
      </header>

      <section className="grid gap-2 md:grid-flow-col md:place-content-start">
        <a
          role="button"
          href="mailto:rkkautsar@gmail.com"
          className="btn btn-primary md:w-48"
          data-splitbee-event="External Link"
          data-splitbee-event-type="contact"
        >
          Get in touch
        </a>
        <a
          role="button"
          href="/resume"
          className="btn btn-secondary md:w-48"
          data-splitbee-event="External Link"
          data-splitbee-event-type="resume"
        >
          Resumé
        </a>
        <a
          role="button"
          href="/blog"
          className="btn btn-secondary md:w-48"
          data-splitbee-event="External Link"
          data-splitbee-event-type="blog"
        >
          Writings
        </a>
      </section>

      <main>
        <h2 className="font-sans text-3xl font-bold mb-2">
          Highlighted Projects
        </h2>
        <div className="grid place-items-center md:grid-cols-2 gap-2">
          {data.github.user.pinnedItems.edges.map((item) => (
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

      <footer className="flex flex-col content-center text-center text-ink-700">
        <p>Handcrafted with ❤️</p>
        <a
          target="_blank"
          rel="noopener"
          className="text-blue-600 font-mono"
          href="https://github.com/rkkautsar/personal-website"
        >
          &lt; repo /&gt;
        </a>

        <section className="grid md:grid-flow-col place-content-center social mt-4">
          {socials.map((social, index) => (
            <a
              key={social.name}
              role="button"
              href={`/${social.name}`}
              className="btn btn-secondary"
              data-splitbee-event="External Link"
              data-splitbee-event-type={social.name}
            >
              {social.name}
            </a>
          ))}
        </section>
      </footer>
    </div>
  );
}
