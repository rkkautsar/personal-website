import { h } from 'preact';
import { Router } from 'preact-router';
import { Match } from 'preact-router/match';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-20001041-2', {
  debug: process.env.NODE_ENV !== 'production'
});

import Header from './header';
import Home from 'async!../routes/home';
import Projects from 'async!../routes/projects';
import Experiences from 'async!../routes/experiences';

const handleRouteChange = e => {
  ReactGA.pageview(e.url);
}

export default function App() {
  return (
    <div id="app">
      <Match>{({ path }) => <Header isHome={path !== '/'} />}</Match>
      <Router onChange={handleRouteChange}>
        <Home path="/" />
        <Projects path="/projects" />
        <Experiences path="/experiences" />
      </Router>
    </div>
  );
}
