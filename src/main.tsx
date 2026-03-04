import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to user to update the app
    if (confirm("新版本已准备就绪。重新加载以更新应用？")) {
      updateSW();
    }
  },
  onOfflineReady() {
    console.log("应用已准备好离线使用了！");
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
