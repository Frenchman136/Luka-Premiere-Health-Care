import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
import { NotFoundPage } from "./components/NotFoundPage";
import { Footer } from "./components/Footer";
import { AdminDashboard } from "./components/AdminDashboard";
import { auth } from "./utils/firebase";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(
  /\/$/,
  ""
);

function App() {
  const [hash, setHash] = useState(() => window.location.hash || "#/");
  const [adminStatus, setAdminStatus] = useState("unknown");

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminStatus("guest");
        return;
      }

      setAdminStatus("checking");
      try {
        const token = await user.getIdToken();
        const response = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Auth check failed");
        }
        const payload = await response.json();
        setAdminStatus(payload?.user?.role === "ADMIN" ? "admin" : "user");
      } catch {
        setAdminStatus("user");
      }
    });

    return () => unsubscribe();
  }, []);

  const routePath = hash.startsWith("#/") ? hash.slice(2) : "";
  const [routeRoot, routeSlug] = routePath.split("/");
  const isAdminRoute = routeRoot === "admin";
  const isAdmin = adminStatus === "admin";
  const isCheckingAdmin = adminStatus === "checking" || adminStatus === "unknown";

  const renderHome = () => (
    <>
      <HeroSection />
      <QuickAccess />
      <Services previewCount={4} />
      <Doctors />
      <Emergency />
      <ContactTeaser />
      <Testimonials />
      <About variant="compact" />
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
  } else if (routeRoot === "admin") {
    if (isCheckingAdmin) {
      pageContent = (
        <main className="page-shell">
          <div className="page">
            <h1>Checking access...</h1>
            <p>Please wait while we verify your admin permissions.</p>
          </div>
        </main>
      );
    } else if (isAdmin) {
      pageContent = <AdminDashboard />;
    } else {
      pageContent = <NotFoundPage />;
    }
  } else if (routeRoot) {
    pageContent = <NotFoundPage />;
  }

  return (
    <div>
      <NavigationBar showAdminLink={isAdmin} />
      {pageContent}
      {!isAdminRoute && routeRoot !== "appointment" && <Footer />}
    </div>
  );
}

export default App;
