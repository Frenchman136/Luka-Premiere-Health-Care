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
import { HealthBlog, HealthBlogPage } from "./components/HealthBlog";
import { ContactSection } from "./components/ContactSection";
import { Footer } from "./components/Footer";

function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const stored =
      window.localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = stored;

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
  if (hash.startsWith("#/blog")) {
    return <HealthBlogPage />;
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
