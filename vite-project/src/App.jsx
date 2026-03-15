import { useEffect, useState } from "react";
import "./App.css";
import { NavigationBar } from "./components/NavigationBar";
import { HeroSection } from "./components/HeroSection";
import { QuickAccess } from "./components/QuickAccess";
import { Services, ServiceDetailPage, ServicesPage } from "./components/Services";
import { Doctors, DoctorsPage } from "./components/Doctors";
import { Appointments } from "./components/Appointments";
import { Emergency } from "./components/Emergency";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { HealthBlog, HealthBlogPage } from "./components/HealthBlog";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { ContactTeaser } from "./components/ContactTeaser";
import { EmergencyPage } from "./components/EmergencyPage";
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

  useEffect(() => {
    if (hash.startsWith("#/")) {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const routePath = hash.startsWith("#/") ? hash.slice(2) : "";
  const [routeRoot, routeSlug] = routePath.split("/");

  const renderHome = () => (
    <>
      <HeroSection />
      <QuickAccess />
      <Services />
      <Doctors />
      <Testimonials />
      <Emergency />
      <ContactTeaser />
      <About />
      <HealthBlog />
    </>
  );

  let pageContent = renderHome();

  if (routeRoot === "appointment") {
    pageContent = <Appointments />;
  } else if (routeRoot === "services") {
    pageContent = routeSlug ? (
      <ServiceDetailPage slug={routeSlug} />
    ) : (
      <ServicesPage />
    );
  } else if (routeRoot === "doctors") {
    pageContent = <DoctorsPage />;
  } else if (routeRoot === "blog") {
    pageContent = <HealthBlogPage />;
  } else if (routeRoot === "about") {
    pageContent = <AboutPage />;
  } else if (routeRoot === "contact") {
    pageContent = <ContactPage />;
  } else if (routeRoot === "emergency") {
    pageContent = <EmergencyPage />;
  }

  return (
    <div>
      <NavigationBar />
      {pageContent}
      {routeRoot !== "appointment" && <Footer />}
    </div>
  );
}

export default App;
