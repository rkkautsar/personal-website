import './style.css';
import * as React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

let ga: firebase.analytics.Analytics | null = null;
if (typeof window !== 'undefined') {
  (async () => {
    const firebase = await import('lib/services/firebase');
    ga = firebase.analytics;
  })();
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  React.useEffect(() => {
    const handleRouteChange = (url) => {
      if (ga == null) return;
      ga.setCurrentScreen(document.title);
      ga.logEvent('page_view', {
        page_location: router.asPath,
        page_path: router.pathname,
        page_title: document.title,
      });
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, []);

  return (
    <>
      <Head>
        <script defer src="https://cdn.splitbee.io/sb.js"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Rakha Kanz Kautsar is currently a software engineer at Shopee, Singapore. He's a React Native developer currently focusing on performance."
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
