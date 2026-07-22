import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import Layout from "./Layout";
import Overview from "./pages/Overview";
import Countries from "./pages/Countries";
import RoutesPage from "./pages/RoutesPage";
import IndiaImpact from "./pages/IndiaImpact";
import Recommendations from "./pages/Recommendations";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/india-impact" element={<IndiaImpact />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
