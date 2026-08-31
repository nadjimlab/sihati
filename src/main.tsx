import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { swManager } from './utils/serviceWorkerRegistration';

// Register Service Worker for offline capability & PWA caching
swManager.register();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

