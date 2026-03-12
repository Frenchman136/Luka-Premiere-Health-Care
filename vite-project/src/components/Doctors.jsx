import '../assets/styles/Doctors.css';

export function Doctors() {
  return (
    <section id="doctors" className="doctors is-collapsed">
      <div className="container">
        <div className="section-header">
          <h2>Meet Our Expert Doctors</h2>
          <p>
            Experienced healthcare professionals dedicated to your wellbeing
          </p>
        </div>
        <div className="doctors-grid">
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor5.webp"
                alt="Dr. Aggrey Kadima"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Aggrey Kadima</h3>
              <p className="specialty">Cardiologist</p>
              <p className="credentials">MD, FACC - 15 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor4.webp"
                alt="Dr. Bilha Anjili"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Bilha Anjili</h3>
              <p className="specialty">Pediatrician</p>
              <p className="credentials">MD, FAAP - 12 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor1.webp"
                alt="Dr. Zaccheus Junior"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Zaccheus Junior</h3>
              <p className="specialty">Neurologist</p>
              <p className="credentials">MD, PhD - 18 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor6.webp"
                alt="Dr. James Kamau"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. James Kamau</h3>
              <p className="specialty">Orthopedic Surgeon</p>
              <p className="credentials">MD, FAAOS - 14 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor.webp"
                alt="Dr. Leah Wanjiku"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Mzee Isaac</h3>
              <p className="specialty">Dermatologist</p>
              <p className="credentials">MD, FAAD - 10 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor2.webp"
                alt="Dr. Samuel Otieno"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Samuel Otieno</h3>
              <p className="specialty">General Surgeon</p>
              <p className="credentials">MD, FACS - 11 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
          <div className="doctor-card">
            <div className="doctor-image">
              <img
                src="/images/doctors/doctor3.webp"
                alt="Dr. Faith Achieng"
                width="400"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="doctor-info">
              <h3>Dr. Faith Achieng</h3>
              <p className="specialty">Obstetrician</p>
              <p className="credentials">MD, FACOG - 9 years experience</p>
              <a href="#appointment" className="btn btn-small btn-primary">
                Book Appointment
              </a>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-outline doctors-view-all"
            aria-expanded="false"
          >
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
}

