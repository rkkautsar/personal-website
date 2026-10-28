import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './pages/Home';
import './index.css';

const root = document.getElementById('root')!;
const app = (
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);

const isBlogRoute = window.location.pathname === '/blog' || window.location.pathname.startsWith('/blog/');

if (import.meta.env.DEV && isBlogRoute) {
  void import('./blog/dev').then(({ renderDevBlog }) => renderDevBlog(root, window.location.pathname));
} else if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
