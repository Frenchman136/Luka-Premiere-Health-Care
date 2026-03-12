import { useMemo } from "react";
import "../assets/styles/Doctors.css";

const DOCTORS = [
  {
    name: "Dr. Aggrey Kadima",
    specialty: "Cardiologist",
    credentials: "MD, FACC - 15 years experience",
    image: "/images/doctors/doctor5.webp",
  },
  {
    name: "Dr. Bilha Anjili",
    specialty: "Pediatrician",
    credentials: "MD, FAAP - 12 years experience",
    image: "/images/doctors/doctor4.webp",
  },
  {
    name: "Dr. Zaccheus Junior",
    specialty: "Neurologist",
    credentials: "MD, PhD - 18 years experience",
    image: "/images/doctors/doctor1.webp",
  },
  {
    name: "Dr. James Kamau",
    specialty: "Orthopedic Surgeon",
    credentials: "MD, FAAOS - 14 years experience",
    image: "/images/doctors/doctor6.webp",
  },
  {
    name: "Dr. Mzee Isaac",
    specialty: "Dermatologist",
    credentials: "MD, FAAD - 10 years experience",
    image: "/images/doctors/doctor.webp",
  },
  {
    name: "Dr. Samuel Otieno",
    specialty: "General Surgeon",
    credentials: "MD, FACS - 11 years experience",
    image: "/images/doctors/doctor2.webp",
  },
  {
    name: "Dr. Faith Achieng",
    specialty: "Obstetrician",
    credentials: "MD, FACOG - 9 years experience",
    image: "/images/doctors/doctor3.webp",
  },
];

const getRandomSubset = (items, count) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

function DoctorsGrid({ items }) {
  return (
    <div className="doctors-grid">
      {items.map((doctor) => (
        <div className="doctor-card" key={doctor.name}>
          <div className="doctor-image">
            <img
              src={doctor.image}
              alt={doctor.name}
              width="400"
              height="500"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="doctor-info">
            <h3>{doctor.name}</h3>
            <p className="specialty">{doctor.specialty}</p>
            <p className="credentials">{doctor.credentials}</p>
            <a
              href="#/appointment"
              target="_blank"
              rel="noreferrer"
              className="btn btn-small btn-primary"
            >
              Book Appointment
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Doctors({ showAll = false }) {
  const previewCount = 3;
  const previewDoctors = useMemo(
    () => getRandomSubset(DOCTORS, previewCount),
    []
  );

  const doctorsToShow = showAll ? DOCTORS : previewDoctors;

  return (
    <section id="doctors" className="doctors">
      <div className="container">
        <div className="section-header">
          <h2>{showAll ? "All Doctors" : "Meet Our Expert Doctors"}</h2>
          <p>
            {showAll
              ? "Browse our full specialist team and find the right care."
              : "Experienced healthcare professionals dedicated to your wellbeing"}
          </p>
        </div>
        <DoctorsGrid items={doctorsToShow} />
        {!showAll && (
          <div className="doctors-actions">
            <a
              href="#/doctors"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              View All Doctors
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function DoctorsPage() {
  return <Doctors showAll />;
}

