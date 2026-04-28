import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { WineShell } from './vin/WineShell.tsx';
import { VinPage } from './vin/pages/VinPage.tsx';
import { ProformaPage } from './vin/pages/ProformaPage.tsx';
import { PaymentStatusPage } from './vin/pages/PaymentStatusPage.tsx';
import { FinaliserPage } from './vin/pages/FinaliserPage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/vin" element={<VinPage />} />
        <Route path="/vin/proforma/:ref" element={<ProformaPage />} />
        <Route path="/vin/paiement/succes" element={<PaymentStatusPage intent="succes" />} />
        <Route path="/vin/paiement/attente" element={<PaymentStatusPage intent="attente" />} />
        <Route path="/vin/paiement/annule" element={<PaymentStatusPage intent="annule" />} />
        <Route path="/vin/finaliser" element={<FinaliserPage />} />
        <Route path="/vin/*" element={<WineShell />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
