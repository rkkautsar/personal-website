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

if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
