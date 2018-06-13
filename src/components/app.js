import { h } from 'preact';
import { Router } from 'preact-router';
import { Match } from 'preact-router/match';

import Header from './header';
import Home from 'async!../routes/home';
import Projects from 'async!../routes/projects';
import Experiences from 'async!../routes/experiences';

export default function App() {
  return (
    <div id="app">
      <Match>{({ path }) => <Header isHome={path !== '/'} />}</Match>
      <Router>
        <Home path="/" />
        <Projects path="/projects" />
        <Experiences path="/experiences" />
      </Router>
    </div>
  );
}
