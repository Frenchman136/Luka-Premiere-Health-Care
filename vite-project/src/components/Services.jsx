import { useMemo, useState } from "react";
import "../assets/styles/Services.css";
import { trackEvent } from "../utils/analytics";

const SERVICES = [
  {
    slug: "cardiology",
    name: "Cardiology",
    category: "Heart and Vascular",
    description: "Advanced diagnostics, prevention, and heart wellness planning.",
    icon: "fas fa-heartbeat",
    priceRange: "KSh 6,500 - 18,000",
    duration: "45-60 min",
    availability: "Mon-Sat, 8:00 AM - 6:00 PM",
    nextAvailable: "Today, 4:30 PM",
    highlights: [
      "ECG and echo review",
      "Personalized risk assessment",
      "Same-day follow ups",
    ],
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    category: "Women and Child",
    description: "Compassionate care for infants, children, and adolescents.",
    icon: "fas fa-baby",
    priceRange: "KSh 3,500 - 9,000",
    duration: "30-45 min",
    availability: "Mon-Sun, 9:00 AM - 7:00 PM",
    nextAvailable: "Tomorrow, 9:15 AM",
    highlights: [
      "Growth and nutrition checks",
      "Immunization scheduling",
      "Same-day urgent slots",
    ],
  },
  {
    slug: "neurology",
    name: "Neurology",
    category: "Neuro and Rehab",
    description: "Specialist care for brain, spine, and nervous system health.",
    icon: "fas fa-brain",
    priceRange: "KSh 8,000 - 20,000",
    duration: "60-75 min",
    availability: "Mon-Fri, 10:00 AM - 6:00 PM",
    nextAvailable: "Friday, 11:00 AM",
    highlights: [
      "MRI and EEG coordination",
      "Headache and seizure clinics",
      "Care plan follow ups",
    ],
  },
  {
    slug: "orthopedics",
    name: "Orthopedics",
    category: "Bones and Joints",
    description: "Bone, joint, and sports injury treatment programs.",
    icon: "fas fa-bone",
    priceRange: "KSh 5,500 - 15,000",
    duration: "40-60 min",
    availability: "Mon-Sat, 8:00 AM - 5:30 PM",
    nextAvailable: "Thursday, 2:00 PM",
    highlights: [
      "On-site imaging review",
      "Physio coordination",
      "Post-surgery rehab plans",
    ],
  },
  {
    slug: "radiology",
    name: "Radiology",
    category: "Imaging",
    description: "High-resolution imaging with rapid turnaround reports.",
    icon: "fas fa-x-ray",
    priceRange: "KSh 2,500 - 12,000",
    duration: "20-40 min",
    availability: "Mon-Sun, 7:00 AM - 9:00 PM",
    nextAvailable: "Today, 6:15 PM",
    highlights: [
      "Digital X-ray and ultrasound",
      "Same-day reporting",
      "Specialist imaging review",
    ],
  },
  {
    slug: "surgery",
    name: "Surgery",
    category: "Surgical Care",
    description: "Comprehensive pre-op and post-op surgical care.",
    icon: "fas fa-procedures",
    priceRange: "KSh 18,000 - 65,000",
    duration: "Varies by procedure",
    availability: "Mon-Fri, 8:00 AM - 6:00 PM",
    nextAvailable: "Consultation in 3 days",
    highlights: [
      "Board-certified surgeons",
      "Pre-op planning session",
      "Dedicated recovery team",
    ],
  },
  {
    slug: "laboratory",
    name: "Laboratory",
    category: "Diagnostics",
    description: "Accurate diagnostic testing with online result access.",
    icon: "fas fa-vial",
    priceRange: "KSh 1,200 - 8,500",
    duration: "15-30 min",
    availability: "Mon-Sun, 6:30 AM - 8:00 PM",
    nextAvailable: "Walk-in available",
    highlights: [
      "Same-day labs",
      "Chronic care monitoring",
      "Insurance billing support",
    ],
  },
  {
    slug: "pharmacy",
    name: "Pharmacy",
    category: "Pharmacy",
    description: "24/7 pharmacy support with home delivery options.",
    icon: "fas fa-pills",
    priceRange: "Cash and insurance accepted",
    duration: "Pickup in 10-15 min",
    availability: "Always open",
    nextAvailable: "Ready now",
    highlights: [
      "Medication counseling",
      "Refill reminders",
      "Chronic care packaging",
    ],
  },
  {
    slug: "emergency-care",
    name: "Emergency Care",
    category: "Emergency",
    description: "Round-the-clock emergency response and stabilization.",
    icon: "fas fa-ambulance",
    priceRange: "Varies by case",
    duration: "Immediate triage",
    availability: "24/7",
    nextAvailable: "Immediate",
    highlights: [
      "Trauma-ready team",
      "Rapid imaging access",
      "Dedicated emergency hotline",
    ],
  },
  {
    slug: "oncology",
    name: "Oncology",
    category: "Cancer Care",
    description: "Personalized oncology plans with multidisciplinary teams.",
    icon: "fas fa-stethoscope",
    priceRange: "Consultation from KSh 9,500",
    duration: "60-90 min",
    availability: "Mon-Fri, 9:00 AM - 5:00 PM",
    nextAvailable: "Next Monday, 1:00 PM",
    highlights: [
      "Tumor board reviews",
      "Infusion coordination",
      "Supportive therapy plans",
    ],
  },
];

const getCategories = () => ["All", ...new Set(SERVICES.map((item) => item.category))];

function ServiceCard({ service, variant = "compact" }) {
  const isExpanded = variant === "expanded";

  return (
    <div className={`service-card ${isExpanded ? "service-card--expanded" : "service-card--compact"}`}>
      <i className={service.icon}></i>
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      {isExpanded && (
        <div className="service-meta">
          <span>{service.priceRange}</span>
          <span>{service.availability}</span>
        </div>
      )}
      <a
        href={`#/services/${service.slug}`}
        className="service-link"
        onClick={() => trackEvent("service_detail_open", { service: service.slug })}
      >
        {isExpanded ? "View details" : "Learn More"}
      </a>
    </div>
  );
}

export function Services({ previewCount = 6 }) {
  const previewServices = SERVICES.slice(0, previewCount);

  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-header">
          <h2>Our Medical Services</h2>
          <p>Comprehensive healthcare solutions for you and your family</p>
        </div>
        <div className="services-grid services-grid--compact">
          {previewServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
        <div className="services-actions">
          <a
            href="#/services"
            className="btn btn-outline"
            onClick={() => trackEvent("services_view_all", { source: "home" })}
          >
            View all services
          </a>
        </div>
      </div>
    </section>
  );
}

export function ServicesPage() {
  const categories = useMemo(() => getCategories(), []);
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredServices = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    return SERVICES.filter((service) => {
      const matchesCategory =
        activeCategory === "All" || service.category === activeCategory;
      const matchesQuery = !trimmed
        ? true
        : `${service.name} ${service.description} ${service.category}`
            .toLowerCase()
            .includes(trimmed);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <main className="page-shell">
      <section className="page-hero page-hero--services">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">Services</span>
            <h1>Find the right care fast.</h1>
            <p>
              Explore every specialty at Luka Premiere Health Care and book your
              next visit with confidence.
            </p>
            <div className="page-actions">
              <a href="#/appointment" className="btn btn-primary">
                Book an appointment
              </a>
              <a href="#/emergency" className="btn btn-outline">
                Emergency help
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Need help choosing?</h3>
            <p>Call our care team for matching and same-day routing.</p>
            <strong className="hero-highlight">+254 700 000 111</strong>
            <span className="hero-subtext">Emergency hotline, 24/7</span>
          </div>
        </div>
      </section>

      <section className="services-page">
        <div className="container">
          <div className="services-toolbar">
            <div className="services-filters" role="tablist" aria-label="Filter services">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-chip ${activeCategory === category ? "is-active" : ""}`}
                  onClick={() => {
                    setActiveCategory(category);
                    trackEvent("services_filter", { category });
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="services-search">
              <input
                type="search"
                placeholder="Search services..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  trackEvent("services_search", { query: event.target.value });
                }}
                aria-label="Search services"
              />
            </div>
          </div>
          <div className="services-grid services-grid--expanded">
            {filteredServices.map((service) => (
              <ServiceCard key={service.slug} service={service} variant="expanded" />
            ))}
          </div>
          {filteredServices.length === 0 && (
            <p className="empty-state">No services found. Try a different search.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export function ServiceDetailPage({ slug }) {
  const service = SERVICES.find((item) => item.slug === slug);

  if (!service) {
    return (
      <main className="page-shell">
        <section className="page-hero page-hero--services">
          <div className="container page-hero-grid">
            <div>
              <span className="page-eyebrow">Service not found</span>
              <h1>We could not find that service.</h1>
              <p>Browse our full list or contact our team for help.</p>
              <div className="page-actions">
                <a href="#/services" className="btn btn-primary">
                  View all services
                </a>
                <a href="#/contact" className="btn btn-outline">
                  Contact care team
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="page-hero page-hero--service">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">{service.category}</span>
            <h1>{service.name}</h1>
            <p>{service.description}</p>
            <div className="page-actions">
              <a href="#/appointment" className="btn btn-primary">
                Book now
              </a>
              <a href="#/services" className="btn btn-outline">
                Back to services
              </a>
            </div>
          </div>
          <div className="page-hero-card service-hero-card">
            <h3>Availability</h3>
            <p>{service.availability}</p>
            <div className="service-hero-meta">
              <span>{service.priceRange}</span>
              <span>{service.duration}</span>
            </div>
            <strong className="hero-highlight">{service.nextAvailable}</strong>
            <span className="hero-subtext">Next open slot</span>
          </div>
        </div>
      </section>

      <section className="service-detail">
        <div className="container service-detail-grid">
          <div>
            <h2>What is included</h2>
            <ul className="service-highlights">
              {service.highlights.map((item) => (
                <li key={item}>
                  <i className="fas fa-check-circle" aria-hidden="true"></i>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="service-detail-info">
              <div>
                <h3>Pricing</h3>
                <p>{service.priceRange}</p>
              </div>
              <div>
                <h3>Typical visit time</h3>
                <p>{service.duration}</p>
              </div>
              <div>
                <h3>How to prepare</h3>
                <p>
                  Bring recent medical records, insurance details, and a list of
                  current medications.
                </p>
              </div>
            </div>
          </div>
          <aside className="service-detail-aside">
            <div className="service-detail-card">
              <h4>Ready to book?</h4>
              <p>Reserve your visit or speak with a care coordinator now.</p>
              <a href="#/appointment" className="btn btn-primary btn-large">
                Schedule appointment
              </a>
              <a href="#/contact" className="btn btn-outline btn-large">
                Talk to a coordinator
              </a>
            </div>
            <div className="service-detail-card service-team-card">
              <h4>Meet the care team</h4>
              <p>Find the specialists who lead {service.name} care.</p>
              <a href="#/doctors" className="btn btn-outline btn-large">
                View doctors
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
