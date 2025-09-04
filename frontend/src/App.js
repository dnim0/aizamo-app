import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogoLoadingScreen from "./components/LogoLoadingScreen";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import Services from "./components/Services";
import About from "./components/About";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Roadmap from "./components/Roadmap";
import Footer from "./components/Footer";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <div className="App">
      {isLoading && <LogoLoadingScreen onComplete={handleLoadingComplete} />}
      
      {!isLoading && (
        <BrowserRouter>
          <Navigation />
          <Hero />
          <Services />
          <About />
          <Testimonials />
          <Roadmap />
          <Contact />
          <Footer />
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;