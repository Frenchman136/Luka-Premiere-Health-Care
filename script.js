// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
const themeLabel = themeToggle ? themeToggle.querySelector("span") : null;
const themeStorageKey = "luka-theme";
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

const setTheme = (theme) => {
  const darkMode = theme === "dark";
  document.body.classList.toggle("dark-mode", darkMode);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", darkMode ? "true" : "false");
  }

  if (themeIcon) {
    themeIcon.className = darkMode ? "fas fa-sun" : "fas fa-moon";
  }

  if (themeLabel) {
    themeLabel.textContent = darkMode ? "Light" : "Dark";
  }
};

const getInitialTheme = () => {
  let storedTheme = null;

  try {
    storedTheme = localStorage.getItem(themeStorageKey);
  } catch (error) {
    storedTheme = null;
  }

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

setTheme(getInitialTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-mode");
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);

    try {
      localStorage.setItem(themeStorageKey, nextTheme);
    } catch (error) {
      // Ignore storage errors and keep theme in-memory for this session.
    }
  });
}

hamburger.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("active");
  hamburger.classList.toggle("active", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");
  navLinks.setAttribute("aria-hidden", isOpen ? "false" : "true");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navLinks.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    navLinks.setAttribute("aria-hidden", "true");
  });
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Scroll to Top Button
const scrollTopBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

const showFormStatus = (form, message) => {
  const status = form.querySelector(".form-status");
  if (!status) return;

  status.textContent = message;
  status.classList.add("is-visible");

  if (status._timeoutId) {
    clearTimeout(status._timeoutId);
  }

  status._timeoutId = setTimeout(() => {
    status.classList.remove("is-visible");
  }, 6000);
};

// Form Submission Handlers
const appointmentForm = document.querySelector(".appointment-form");
const contactForm = document.querySelector(".contact-form");

if (appointmentForm) {
  appointmentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      date: document.getElementById("date").value,
      department: document.getElementById("department").value,
      doctor: document.getElementById("doctor").value,
      message: document.getElementById("message").value,
    };

    // Here you would typically send this data to a server
    console.log("Appointment Data:", formData);

    // Show success message
    showFormStatus(
      appointmentForm,
      "Thank you! Your appointment request has been submitted. We will contact you shortly to confirm.",
    );

    // Reset form
    appointmentForm.reset();
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById("contactName").value,
      email: document.getElementById("contactEmail").value,
      phone: document.getElementById("contactPhone").value,
      subject: document.getElementById("contactSubject").value,
      message: document.getElementById("contactMessage").value,
    };

    // Here you would typically send this data to a server
    console.log("Contact Data:", formData);

    // Show success message
    showFormStatus(
      contactForm,
      "Thank you for contacting us! We will get back to you as soon as possible.",
    );

    // Reset form
    contactForm.reset();
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Don't prevent default for links that don't have a valid target
    if (href === "#" || href === "#!") {
      e.preventDefault();
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offsetTop = target.offsetTop - 72; // Account for sticky navbar height

      window.scrollTo({
        top: offsetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }
  });
});

// Animate elements on scroll
// Observe all cards and sections
document.addEventListener("DOMContentLoaded", () => {
  const animatedElements = document.querySelectorAll(
    ".service-card, .doctor-card, .quick-card, .blog-card, .feature-card",
  );

  if (prefersReducedMotion) {
    animatedElements.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.transition = "none";
    });
    return;
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
});

// Testimonials auto-slide
const testimonialsTrack = document.querySelector(".testimonials-grid");
if (testimonialsTrack) {
  if (!prefersReducedMotion) {
    const cards = testimonialsTrack.querySelectorAll(".testimonial-card");
    let slideStep = 0;
    let sliderTimer = null;

    const getGap = () => {
      const styles = getComputedStyle(testimonialsTrack);
      const gapValue = styles.columnGap || styles.gap || "0";
      const parsed = Number.parseFloat(gapValue);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const updateStep = () => {
      if (!cards.length) {
        slideStep = 0;
        return;
      }

      const cardWidth = cards[0].getBoundingClientRect().width;
      slideStep = cardWidth + getGap();
    };

    const startAutoSlide = () => {
      if (sliderTimer || slideStep === 0) return;

      sliderTimer = setInterval(() => {
        const maxScrollLeft =
          testimonialsTrack.scrollWidth - testimonialsTrack.clientWidth;

        if (testimonialsTrack.scrollLeft + slideStep >= maxScrollLeft - 2) {
          testimonialsTrack.scrollTo({ left: 0, behavior: "smooth" });
          return;
        }

        testimonialsTrack.scrollBy({ left: slideStep, behavior: "smooth" });
      }, 4000);
    };

    const stopAutoSlide = () => {
      if (!sliderTimer) return;
      clearInterval(sliderTimer);
      sliderTimer = null;
    };

    updateStep();
    startAutoSlide();

    window.addEventListener("resize", () => {
      updateStep();
      stopAutoSlide();
      startAutoSlide();
    });

    testimonialsTrack.addEventListener("mouseenter", stopAutoSlide);
    testimonialsTrack.addEventListener("mouseleave", startAutoSlide);
    testimonialsTrack.addEventListener("touchstart", stopAutoSlide, {
      passive: true,
    });
    testimonialsTrack.addEventListener("touchend", startAutoSlide);
  }
}

// Blog "View All Articles" toggle
const blogSection = document.querySelector(".blog");
const blogViewAllBtn = document.querySelector(".blog-view-all");

if (blogSection && blogViewAllBtn) {
  blogViewAllBtn.addEventListener("click", () => {
    const isCollapsed = blogSection.classList.toggle("is-collapsed");
    const expanded = !isCollapsed;
    blogViewAllBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
    blogViewAllBtn.textContent = expanded ? "Show Less" : "View All Articles";
  });
}

// Doctors random order + View All toggle
const doctorsSection = document.querySelector(".doctors");
const doctorsGrid = document.querySelector(".doctors-grid");
const doctorsViewAllBtn = document.querySelector(".doctors-view-all");

if (doctorsGrid) {
  const doctorCards = Array.from(doctorsGrid.children);
  for (let i = doctorCards.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [doctorCards[i], doctorCards[j]] = [doctorCards[j], doctorCards[i]];
  }
  doctorCards.forEach((card) => doctorsGrid.appendChild(card));
}

if (doctorsSection && doctorsViewAllBtn) {
  doctorsViewAllBtn.addEventListener("click", () => {
    const isCollapsed = doctorsSection.classList.toggle("is-collapsed");
    const expanded = !isCollapsed;
    doctorsViewAllBtn.setAttribute(
      "aria-expanded",
      expanded ? "true" : "false",
    );
    doctorsViewAllBtn.textContent = expanded ? "Show Less" : "View All Doctors";
  });
}

// Set minimum date for appointment booking (today)
const dateInput = document.getElementById("date");
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}

// Dynamic doctor selection based on department
const departmentSelect = document.getElementById("department");
const doctorSelect = document.getElementById("doctor");

if (departmentSelect && doctorSelect) {
  const doctorsByDepartment = {
    cardiology: [{ value: "dr-johnson", text: "Dr. Sarah Johnson" }],
    pediatrics: [{ value: "dr-omondi", text: "Dr. Michael Omondi" }],
    neurology: [{ value: "dr-wanjiku", text: "Dr. Grace Wanjiku" }],
    orthopedics: [{ value: "dr-kamau", text: "Dr. James Kamau" }],
    general: [
      { value: "dr-johnson", text: "Dr. Sarah Johnson" },
      { value: "dr-omondi", text: "Dr. Michael Omondi" },
      { value: "dr-wanjiku", text: "Dr. Grace Wanjiku" },
      { value: "dr-kamau", text: "Dr. James Kamau" },
    ],
  };

  departmentSelect.addEventListener("change", (e) => {
    const selectedDepartment = e.target.value;

    // Clear current options except the first one
    doctorSelect.innerHTML = '<option value="">Any Available</option>';

    // Add doctors for selected department
    if (selectedDepartment && doctorsByDepartment[selectedDepartment]) {
      doctorsByDepartment[selectedDepartment].forEach((doctor) => {
        const option = document.createElement("option");
        option.value = doctor.value;
        option.textContent = doctor.text;
        doctorSelect.appendChild(option);
      });
    }
  });
}

// Add loading animation
window.addEventListener("load", () => {
  if (prefersReducedMotion) return;
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.5s ease";
    document.body.style.opacity = "1";
  }, 100);
});
