import { useEffect, useState } from "react";
import "./App.css";
import { NavigationBar } from "./components/NavigationBar";
import { HeroSection } from "./components/HeroSection";
import { QuickAccess } from "./components/QuickAccess";
import { Services } from "./components/Services";
import { Doctors, DoctorsPage } from "./components/Doctors";
import { Appointments } from "./components/Appointments";
import { Emergency } from "./components/Emergency";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { HealthBlog } from "./components/HealthBlog";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || "#/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  if (hash.startsWith("#/appointment")) {
    return <Appointments />;
  }
  if (hash.startsWith("#/doctors")) {
    return <DoctorsPage />;
  }

  return (
    <div>
      <NavigationBar />
      <HeroSection />
      <QuickAccess />
      <Services />
      <Doctors />
      <Emergency />
      <About />
      <Testimonials />
      <HealthBlog />
      <ContactSection />
      <Footer />
    </div>
  );
}

export default App;
