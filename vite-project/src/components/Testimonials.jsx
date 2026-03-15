import '../assets/styles/Testimonials.css';

export function Testimonials() {
  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <div className="section-header">
          <h2>What Our Patients Say</h2>
          <p>Real experiences from real people</p>
        </div>
        <div className="testimonials-slider">
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "Excellent care and professional staff. Dr. Zaccheus was very
                thorough and took time to explain everything. Highly recommend!"
              </p>
              <div className="testimonial-author">
                <img
                  className="testimonial-avatar"
                  src="/images/clients/client-80.webp"
                  srcSet="/images/clients/client-80.webp 80w, /images/clients/client-160.webp 160w"
                  sizes="56px"
                  alt="Aggrey Dj"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial-author-info">
                  <strong>Aggrey Dj</strong>
                  <span>Cardiology Patient</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "The pediatric department is amazing! Dr. Bilha is wonderful
                with children. My son felt comfortable throughout the visit."
              </p>
              <div className="testimonial-author">
                <img
                  className="testimonial-avatar"
                  src="/images/clients/client1-80.webp"
                  srcSet="/images/clients/client1-80.webp 80w, /images/clients/client1-160.webp 160w"
                  sizes="56px"
                  alt="Fesel Chirumban"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial-author-info">
                  <strong>Elisha Singira</strong>
                  <span>Pediatrics Patient</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "Modern facilities and caring staff. The emergency department
                handled my case efficiently. Thank you for saving my life!"
              </p>
              <div className="testimonial-author">
                <img
                  className="testimonial-avatar"
                  src="/images/clients/client2-80.webp"
                  srcSet="/images/clients/client2-80.webp 80w, /images/clients/client2-160.webp 160w"
                  sizes="56px"
                  alt="John Webo"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial-author-info">
                  <strong>John Webo</strong>
                  <span>Emergency Patient</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "The maternity team was supportive and kind. Everything was
                handled with care and professionalism."
              </p>
              <div className="testimonial-author">
                <img
                  className="testimonial-avatar"
                  src="/images/clients/client3-80.webp"
                  srcSet="/images/clients/client3-80.webp 80w, /images/clients/client3-160.webp 160w"
                  sizes="56px"
                  alt="Kilimba Nekesa"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial-author-info">
                  <strong>Kilimba Nekesa</strong>
                  <span>Maternity Patient</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p>
                "Fast service at the outpatient clinic and the staff explained
                the treatment plan clearly. Great experience."
              </p>
              <div className="testimonial-author">
                <img
                  className="testimonial-avatar"
                  src="/images/clients/client-80.webp"
                  srcSet="/images/clients/client-80.webp 80w, /images/clients/client-160.webp 160w"
                  sizes="56px"
                  alt="Brian Kimani"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
                <div className="testimonial-author-info">
                  <strong>Brian Kimani</strong>
                  <span>Outpatient Patient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

