import { useMemo, useState } from "react";
import "../assets/styles/HealthBlog.css";
import { trackEvent } from "../utils/analytics";

const BLOG_POSTS = [
  {
    title: "10 Tips for a Healthy Heart",
    category: "Cardiology",
    summary:
      "Learn essential lifestyle changes to maintain cardiovascular health and prevent heart disease.",
    image: "/images/Health/heart-480.webp",
    srcSet: "/images/Health/heart-480.webp 480w, /images/Health/heart-800.webp 800w",
    alt: "Heart Health",
    featured: true,
  },
  {
    title: "Nutrition Guide for Growing Children",
    category: "Pediatrics",
    summary:
      "Essential nutrients and meal planning tips for your child's healthy development.",
    image: "/images/Health/child-480.webp",
    srcSet: "/images/Health/child-480.webp 480w, /images/Health/child-800.webp 800w",
    alt: "Child Nutrition",
  },
  {
    title: "Managing Stress and Mental Wellbeing",
    category: "Wellness",
    summary:
      "Practical strategies for maintaining mental health in today's fast-paced world.",
    image: "/images/Health/mental-480.webp",
    srcSet: "/images/Health/mental-480.webp 480w, /images/Health/mental-800.webp 800w",
    alt: "Mental Health",
  },
  {
    title: "Building Resilience Through Mindfulness",
    category: "Mental Health",
    summary: "Simple daily practices to improve focus, mood, and emotional balance.",
    image: "/images/Health/mental2-480.webp",
    srcSet:
      "/images/Health/mental2-480.webp 480w, /images/Health/mental2-800.webp 800w",
    alt: "Mindfulness and Resilience",
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

function BlogGrid({ items }) {
  return (
    <div className="blog-grid">
      {items.map((post) => (
        <article
          className={`blog-card ${post.featured ? "blog-card--heart" : ""}`}
          key={post.title}
        >
          <div className="blog-image">
            <img
              src={post.image}
              srcSet={post.srcSet}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
              alt={post.alt}
              width="800"
              height="500"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="blog-content">
            <span className="blog-category">{post.category}</span>
            <h3>{post.title}</h3>
            <p>{post.summary}</p>
            <a href="#" className="blog-link">
              Read More <i className="fas fa-arrow-right"></i>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export function HealthBlog({ showAll = false }) {
  const previewCount = 3;
  const previewPosts = useMemo(
    () => getRandomSubset(BLOG_POSTS, previewCount),
    []
  );
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return BLOG_POSTS;
    return BLOG_POSTS.filter((post) => {
      const haystack = `${post.title} ${post.category} ${post.summary}`.toLowerCase();
      return haystack.includes(trimmed);
    });
  }, [query]);

  const postsToShow = showAll ? filteredPosts : previewPosts;

  return (
    <section id="blog" className="blog">
      <div className="container">
        <div className="section-header">
          <h2>{showAll ? "Health Tips & News" : "Health Tips & News"}</h2>
          <p>
            {showAll
              ? "Explore all the latest updates on wellness and patient care."
              : "Stay informed about health and wellness"}
          </p>
        </div>
        {showAll && (
          <div className="blog-tools">
            <input
              type="search"
              className="blog-search"
              placeholder="Search articles..."
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                trackEvent("blog_search", { query: event.target.value });
              }}
              aria-label="Search articles"
            />
          </div>
        )}
        <BlogGrid items={postsToShow} />
        {showAll && postsToShow.length === 0 && (
          <p className="empty-state">No articles found. Try another search.</p>
        )}
        {!showAll && (
          <div className="blog-actions">
            <a
              href="#/blog"
              className="btn btn-outline blog-view-all"
              onClick={() => trackEvent("blog_view_all", { source: "home" })}
            >
              View All Articles
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function HealthBlogPage() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <div className="container page-hero-grid">
          <div>
            <span className="page-eyebrow">Blog</span>
            <h1>Practical health guidance, updated weekly.</h1>
            <p>
              Stay informed with tips, research highlights, and patient-focused
              advice from our specialists.
            </p>
            <div className="page-actions">
              <a href="#/services" className="btn btn-primary">
                Explore services
              </a>
              <a href="#/appointment" className="btn btn-outline">
                Book a visit
              </a>
            </div>
          </div>
          <div className="page-hero-card">
            <h3>Need clinical advice?</h3>
            <p>Our care team can answer questions or schedule follow ups.</p>
            <strong className="hero-highlight">+254 700 000 000</strong>
            <span className="hero-subtext">Mon - Sun, 8:00 AM - 8:00 PM</span>
          </div>
        </div>
      </section>
      <HealthBlog showAll />
    </main>
  );
}

