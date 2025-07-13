import React from 'react';
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from './store/store.js';

import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
);