import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/index';
import Footer from './components/Footer/index';
import Home from './pages/Home';
import Submit from './pages/Submit';
import Electricity from './pages/Electricity';
import SelfAuditElectricity from './pages/SelfAuditElectricity';
import SelfAuditWater from './pages/SelfAuditWater';
import SelfAuditWaste from './pages/SelfAuditWaste';
import Water from './pages/Water';
import Waste from './pages/Waste';
import Methodology from './pages/Methodology';
import Contact from './pages/Contact';
import Data from './pages/Data';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function App() {
  const baseUrl = import.meta.env.BASE_URL;
  return (
    <Router basename={baseUrl}>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/electricity" element={<Electricity />} />
        <Route path="/electricityaudit" element={<SelfAuditElectricity />} />
        <Route path="/wateraudit" element={<SelfAuditWater />} />
        <Route path="/wasteaudit" element={<SelfAuditWaste />} />
        <Route path="/water" element={<Water />} />
        <Route path="/waste" element={<Waste />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/data" element={<Data />} />
      </Routes>
      <Footer />
    </Router>
  );
}
