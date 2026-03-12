import "./App.css";
import { NavigationBar } from "./components/NavigationBar";
import { HeroSection } from "./components/HeroSection";
import { QuickAccess } from "./components/QuickAccess";
import { Services } from "./components/Services";
import { Doctors } from "./components/Doctors";
import { Appointments } from "./components/Appointments";
import { Emergency } from "./components/Emergency";
import { About } from "./components/About";
import { Testimonials } from "./components/Testimonials";
import { HealthBlog } from "./components/HealthBlog";
import { ContactSection } from "./components/ContactSection";

function App() {
  return (
    <div>
      <NavigationBar />
      <HeroSection />
      <QuickAccess />
      <Services />
      <Doctors />
      <Appointments />
      <Emergency />
      <About />
      <Testimonials />
      <HealthBlog />
      <ContactSection />
    </div>
  );
}

export default App;
