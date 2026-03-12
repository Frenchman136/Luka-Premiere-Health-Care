import '../assets/styles/Services.css'

export function Services() {
  return (
    <section id="services" className="services">
      <div className="container">
        <div className="section-header">
          <h2>Our Medical Services</h2>
          <p>Comprehensive healthcare solutions for you and your family</p>
        </div>
        <div className="services-grid">
          <div className="service-card">
            <i className="fas fa-heartbeat"></i>
            <h3>Cardiology</h3>
            <p>Expert heart care and cardiovascular treatments</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-baby"></i>
            <h3>Pediatrics</h3>
            <p>Specialized care for infants, children, and adolescents</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-brain"></i>
            <h3>Neurology</h3>
            <p>Advanced neurological diagnosis and treatment</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-bone"></i>
            <h3>Orthopedics</h3>
            <p>Bone, joint, and muscle care</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-x-ray"></i>
            <h3>Radiology</h3>
            <p>Advanced imaging and diagnostic services</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-procedures"></i>
            <h3>Surgery</h3>
            <p>Comprehensive surgical procedures</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-vial"></i>
            <h3>Laboratory</h3>
            <p>Accurate diagnostic testing</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
          <div className="service-card">
            <i className="fas fa-pills"></i>
            <h3>Pharmacy</h3>
            <p>24/7 pharmaceutical services</p>
            <a href="#" className="service-link">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
