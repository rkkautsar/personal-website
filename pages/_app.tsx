import "./style.css";

if (typeof window !== "undefined") {
  (async () => {
    const { default: ReactGA } = await import("react-ga");

    ReactGA.initialize("UA-20001041-2", {
      debug: process.env.NODE_ENV === "development",
    });
    ReactGA.pageview(window.location.pathname + window.location.search);
  })();
}

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
