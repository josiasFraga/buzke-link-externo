import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RedirectFromAt from './components/RedirectFromAt.tsx'; // importe aqui
import App from './App.tsx';
import NotFound from './pages/NotFound';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/@:username" element={<RedirectFromAt />} />
        <Route path="/:username" element={<App />} />
        <Route path="/" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);