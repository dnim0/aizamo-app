// frontend/src/pages/Home.jsx
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import Roadmap from '@/components/Roadmap';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <About />
      <Testimonials />
      <Roadmap />
      <Contact />
    </>
  );
}
