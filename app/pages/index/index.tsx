import * as React from "react";
import Head from "next/head";
import { requestSummary } from "lib/services/github";
import "./index.module.css";

export async function getStaticProps() {
  try {
    // GraphQL
    const github = await requestSummary();
    return {
      props: {
        github,
      },
    };
  } catch (error) {
    console.error(error);
    if (process.env.NODE_ENV !== "development") {
      process.exit(1);
    }
  }
}

export default function Home(props) {
  return (
    <div className="p-10 space-y-10 max-w-screen-md mx-auto">
      <Head>
        <title>{props.github.user.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="space-y-2">
        <img
          className="rounded-full w-20"
          src={props.github.user.avatarUrl}
          alt="Rakha's avatar"
        />
        <h1 className="leading-tight">{props.github.user.name}</h1>
        <p className="text-sm">
          {props.github.user.company}, {props.github.user.location}
        </p>
        <p className="text-gray-600">{props.github.user.bio}</p>
      </header>

      <section className="grid gap-2 md:grid-flow-col md:place-content-start">
        <a
          role="button"
          href="mailto:rkkautsar@gmail.com"
          className="btn btn-primary md:w-48"
        >
          Get in touch
        </a>
        <a
          role="button"
          href="https://bit.ly/rakha-resume"
          className="btn btn-secondary md:w-48"
        >
          Resumé
        </a>
        <a
          role="button"
          href="https://blog.rakha.dev"
          className="btn btn-secondary md:w-48"
        >
          Writings
        </a>
      </section>

      <main>
        <h2 className="font-sans text-3xl font-bold mb-2">
          Highlighted Projects
        </h2>
        <div className="grid place-items-center md:grid-cols-2 gap-2">
          {props.github.user.pinnedItems.edges.map((item) => (
            <a
              key={item.node.url}
              href={item.node.url}
              className="card h-32 overflow-hidden"
              target="_blank"
              rel="noopener"
            >
              <h3>{item.node.name} &rarr;</h3>
              <p className="text-gray-700 truncate-3-lines">
                {item.node.description}
              </p>
            </a>
          ))}
        </div>

        <a
          role="button"
          className="btn btn-secondary mt-2"
          href={props.github.user.url}
        >
          More on GitHub
        </a>
      </main>

      <footer className="text-center text-gray-600">
        <p>Handcrafted with ❤️</p>
        <a
          target="_blank"
          rel="noopener"
          className="text-blue-600 font-mono"
          href="https://github.com/rkkautsar/personal-website"
        >
          &lt; repo /&gt;
        </a>
      </footer>
    </div>
  );
}
