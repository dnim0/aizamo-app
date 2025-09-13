// frontend/src/App.js
import React, { useState } from "react";
import "./App.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import LogoLoadingScreen from "./components/LogoLoadingScreen";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// Pages
import Home from "@/pages/Home";
import Pricing from "@/pages/Pricing";
import CaseStudies from "@/pages/CaseStudies";
import AboutPage from "@/pages/AboutPage";

// Solutions
import SolutionsIndex from "@/pages/SolutionsIndex";
import SolutionsDetail from "@/pages/SolutionsDetail";

// Industries (NEW)
import IndustriesIndex from "@/pages/IndustriesIndex";
import IndustriesDetail from "@/pages/IndustriesDetail"; // <-- fixed spelling

// Resources
import ResourcesIndex from "@/pages/ResourcesIndex";
import ResourcesCatchAll from "@/pages/ResourcesCatchAll";

// Conversion
import GetStarted from "@/pages/GetStarted";

// System
import NotFound from "@/pages/NotFound";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="App">
      {isLoading && <LogoLoadingScreen onComplete={() => setIsLoading(false)} />}

      {!isLoading && (
        <>
          <Navigation />
          <ScrollToTop />

          {/* No top padding on Home; pad elsewhere to clear fixed nav */}
          <main className={isHome ? "" : "pt-24"}>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Primary conversion */}
              <Route path="/get-started" element={<GetStarted />} />

              {/* Solutions */}
              <Route path="/solutions" element={<SolutionsIndex />} />
              <Route path="/solutions/:slug" element={<SolutionsDetail />} />

              {/* Industries */}
              <Route path="/industries" element={<IndustriesIndex />} />
              <Route path="/industries/:slug" element={<IndustriesDetail />} />

              {/* Pricing / Case Studies / About */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Resources */}
              <Route path="/resources" element={<ResourcesIndex />} />
              <Route path="/resources/*" element={<ResourcesCatchAll />} />

              {/* Legacy redirects (keep old links working) */}
              <Route path="/get-proposal" element={<Navigate to="/get-started" replace />} />
              <Route path="/contact" element={<Navigate to="/get-started" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </>
      )}
    </div>
  );
}
