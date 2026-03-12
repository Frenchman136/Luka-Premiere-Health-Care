import '../assets/styles/HealthBlog.css';

export function HealthBlog() {
  return (
    <section id="research" className="blog is-collapsed">
      <div className="container">
        <div className="section-header">
          <h2>Health Tips & News</h2>
          <p>Stay informed about health and wellness</p>
        </div>
        <div className="blog-grid">
          <article className="blog-card blog-card--heart">
            <div className="blog-image">
              <img
                src="/images/Health/Hearthealth.webp"
                alt="Heart Health"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="blog-content">
              <span className="blog-category">Cardiology</span>
              <h3>10 Tips for a Healthy Heart</h3>
              <p>
                Learn essential lifestyle changes to maintain cardiovascular
                health and prevent heart disease.
              </p>
              <a href="#" className="blog-link">
                Read More <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </article>
          <article className="blog-card">
            <div className="blog-image">
              <img
                src="/images/Health/childnutrition.webp"
                alt="Child Nutrition"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="blog-content">
              <span className="blog-category">Pediatrics</span>
              <h3>Nutrition Guide for Growing Children</h3>
              <p>
                Essential nutrients and meal planning tips for your child's
                healthy development.
              </p>
              <a href="#" className="blog-link">
                Read More <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </article>
          <article className="blog-card">
            <div className="blog-image">
              <img
                src="/images/Health/mentalhealth.webp"
                alt="Mental Health"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="blog-content">
              <span className="blog-category">Wellness</span>
              <h3>Managing Stress and Mental Wellbeing</h3>
              <p>
                Practical strategies for maintaining mental health in today's
                fast-paced world.
              </p>
              <a href="#" className="blog-link">
                Read More <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </article>
          <article className="blog-card">
            <div className="blog-image">
              <img
                src="/images/Health/mentalhealth1.webp"
                alt="Mindfulness and Resilience"
                width="800"
                height="500"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="blog-content">
              <span className="blog-category">Mental Health</span>
              <h3>Building Resilience Through Mindfulness</h3>
              <p>
                Simple daily practices to improve focus, mood, and emotional
                balance.
              </p>
              <a href="#" className="blog-link">
                Read More <i className="fas fa-arrow-right"></i>
              </a>
            </div>
          </article>
        </div>
        <div className="text-center">
          <button
            type="button"
            className="btn btn-outline blog-view-all"
            aria-expanded="false"
          >
            View All Articles
          </button>
        </div>
      </div>
    </section>
  );
}

