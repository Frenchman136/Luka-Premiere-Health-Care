import '../assets/styles/Emergency.css'

export function Emergency() {
  return (
    <section id="emergency" className="emergency">
      <div className="container">
        <div className="emergency-content">
          <div className="emergency-heading">
            <h2>24/7 Emergency Services</h2>
          </div>
          <div className="emergency-info">
            <p>
              Our emergency department is always ready to provide immediate
              medical attention when you need it most.
            </p>
            <ul className="emergency-list">
              <li>
                <i className="fas fa-check-circle"></i> Immediate medical attention
              </li>
              <li>
                <i className="fas fa-check-circle"></i> Advanced life support
              </li>
              <li>
                <i className="fas fa-check-circle"></i> Trauma care specialists
              </li>
              <li>
                <i className="fas fa-check-circle"></i> Ambulance services available
              </li>
            </ul>
            <div className="emergency-contact">
              <div className="emergency-number">
                <i className="fas fa-phone-volume"></i>
                <div>
                  <p>Emergency Hotline</p>
                  <h3>+254 700 000 000</h3>
                </div>
              </div>
              <div className="emergency-number">
                <i className="fas fa-ambulance"></i>
                <div>
                  <p>Ambulance Service</p>
                  <h3>+254 700 000 111</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="emergency-image">
            <img
              src="/images/emergency/emergency.webp"
              alt="Emergency Department"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

