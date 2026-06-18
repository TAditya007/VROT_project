import React, { useEffect, useState } from "react";
import "./HomePage.css";
import heroMain from "../../assets/home/bg home 1.jpg";
import heroOverlay from "../../assets/home/bg home 2.jpg";

const commandStats = [
  { value: "06", label: "Primary services" },
  { value: "10+", label: "Core modules" },
  { value: "24/7", label: "Digital access" },
];

const commandFlow = [
  {
    id: "01",
    title: "Apply",
    text: "Start registration, transfer, NOC, fitness, or RC-related requests from one portal.",
  },
  {
    id: "02",
    title: "Verify",
    text: "Upload documents and move into review-ready service stages.",
  },
  {
    id: "03",
    title: "Track",
    text: "Follow status movement, notifications, and response checkpoints.",
  },
];

const services = [
  {
    title: "Vehicle Registration",
    text: "Guided first-time registration flow with strong step-by-step service clarity.",
  },
  {
    title: "Ownership Transfer",
    text: "Buyer-seller transfer workflow with transparent request progress.",
  },
  {
    title: "RC Copy / Records",
    text: "RC-related service access, request visibility, and document-ready support.",
  },
  {
    title: "Fitness / NOC",
    text: "Fitness certificate and NOC request journeys in one structured portal.",
  },
];

const processSteps = [
  "Create an account and choose the needed vehicle service.",
  "Fill the form, attach required documents, and review the details.",
  "Submit for payment, verification, and service-side processing.",
  "Track updates and receive the final service outcome digitally.",
];

const capabilityData = [
  {
    title: "Citizen Access",
    points: [
      "Apply for registration and transfer services",
      "Upload files and review submitted details",
      "Track application progress and updates",
      "Get service-oriented support guidance",
    ],
  },
  {
    title: "Admin Control",
    points: [
      "Review requests and verify documents",
      "Manage workflow actions and approvals",
      "Monitor service queues and submissions",
      "Support accountable digital governance operations",
    ],
  },
];

const updates = [
  {
    title: "Registration guidance refined",
    text: "Application flow cards now present a clearer service-first structure.",
  },
  {
    title: "Request tracking improved",
    text: "Status visibility is now designed to feel faster and more understandable.",
  },
  {
    title: "Admin review lane strengthened",
    text: "The interface highlights processing stages more cleanly for monitoring use cases.",
  },
];

const faqs = [
  {
    question: "What is VROT?",
    answer:
      "VROT is a digital government-tech portal for vehicle registration and ownership transfer related services.",
  },
  {
    question: "Who can use this platform?",
    answer:
      "Citizens can apply for services, while administrators can review, process, and manage requests.",
  },
  {
    question: "What services are available here?",
    answer:
      "The portal supports registration, transfer, RC requests, NOC services, fitness-related flow, and tracking.",
  },
];

const footerGroups = {
  about: ["About Us", "Platform Vision", "Digital Governance"],
  services: ["Registration", "Ownership Transfer", "RC Copy", "Fitness / NOC"],
  support: ["FAQ", "Quick Help", "Contact Us"],
  legal: ["Privacy Policy", "Terms", "Trademark", "Accessibility"],
};

const sectionLinks = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "process", label: "How It Works" },
  { id: "capabilities", label: "Capabilities" },
  { id: "updates", label: "Updates" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

function HomePage() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const sections = sectionLinks
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="home-page">
      <a href="#vrot-main" className="skip-link">
        Skip to content
      </a>

      <header className="home-fixed-header">
        <div className="section-inner header-inner">
          <div className="header-main-row">
            <div className="hero-brand">VROT</div>

            <div className="header-main-actions">
              <a href="#vrot-main" className="top-link">
                Home
              </a>
              <a href="/login" className="top-login-btn">
                Login
              </a>
            </div>
          </div>

          <nav className="header-section-row" aria-label="Section navigation">
            {sectionLinks.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={activeSection === item.id ? "section-nav-link active" : "section-nav-link"}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="vrot-main">
        <section className="hero-v2 full-width-section">
          <div className="hero-v2-media">
            <img src={heroMain} alt="VROT hero background" className="hero-v2-image hero-v2-base" />
            <img src={heroOverlay} alt="VROT overlay texture" className="hero-v2-image hero-v2-overlay" />
            <div className="hero-v2-shade"></div>
            <div className="hero-v2-grid"></div>
            <div className="hero-v2-scanline"></div>
            <div className="hero-v2-orb hero-v2-orb-left"></div>
            <div className="hero-v2-orb hero-v2-orb-right"></div>
          </div>

          <div className="section-inner hero-v2-layout">
            <div className="hero-v2-copy reveal">
              <span className="hero-tag">Premium Digital Governance Platform</span>
              <h1>
                VROT
                <span>Vehicle Registration & Ownership Transfer</span>
              </h1>

              <p className="hero-lead">
                A modern service portal for vehicle registration, ownership transfer,
                RC services, document workflows, NOC handling, and status-driven
                digital service delivery for both citizens and administrators.
              </p>

              <div className="hero-cta-row">
                <a href="/login" className="hero-btn hero-btn-primary">
                  Launch Portal
                </a>
                <a href="/signup" className="hero-btn hero-btn-secondary">
                  Create Account
                </a>
              </div>

              <div className="hero-proof-row">
                <div className="hero-proof-card">
                  <strong>Citizen + Admin</strong>
                  <span>Unified role-aware experience</span>
                </div>
                <div className="hero-proof-card">
                  <strong>Service-first UX</strong>
                  <span>Built for trust, flow, and clarity</span>
                </div>
              </div>
            </div>

            <div className="hero-v2-stage reveal delay-1">
              <div className="command-panel">
                <div className="command-panel-top">
                  <div>
                    <span className="command-label">VROT Command View</span>
                    <h3>Operational service deck</h3>
                  </div>
                  <div className="command-live">
                    <span className="live-dot"></span>
                    Active
                  </div>
                </div>

                <div className="command-spotlight">
                  <div className="spotlight-copy">
                    <span className="spotlight-tag">Featured service lane</span>
                    <h4>Ownership Transfer Intelligence</h4>
                    <p>
                      A premium operational snapshot showing how service requests
                      move from citizen submission to admin action.
                    </p>
                  </div>

                  <div className="spotlight-core">
                    <div className="core-ring">
                      <div className="core-ring-inner">
                        <span>Readiness</span>
                        <strong>96%</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="command-stats">
                  {commandStats.map((item) => (
                    <div className="command-stat-card" key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="command-flow">
                  {commandFlow.map((item) => (
                    <article className="command-flow-card" key={item.id}>
                      <span className="flow-index">{item.id}</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="fixed-service-strip">
                   <article className="fixed-service-card">
                    <span>Registration</span>
                      <strong>Guided request intake</strong>
                    </article>

                  <article className="fixed-service-card">
                    <span>Tracking</span>
                  <strong>Live application visibility</strong>
                     </article>
                      </div>

              </div></div>
          </div>
        </section>

        <section id="services" className="hero-services-strip section-inner reveal">
          {services.map((service) => (
            <article className="hero-service-tile" key={service.title}>
              <div className="hero-service-line"></div>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </section>

        <section id="about" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">About VROT</span>
            <h2>Built for modern vehicle service operations.</h2>
            <p>
              VROT is a Meeseva-style digital governance platform designed to
              simplify how users apply for vehicle-related services and how admins
              manage approvals, verification, and service movement.
            </p>
          </div>

          <div className="triple-grid">
            <article className="glass-block">
              <h3>What are we</h3>
              <p>A premium government-tech platform focused on service clarity and process confidence.</p>
            </article>
            <article className="glass-block">
              <h3>What this website is for</h3>
              <p>To centralize registration, transfer, RC, NOC, and workflow-driven vehicle services.</p>
            </article>
            <article className="glass-block">
              <h3>Why it matters</h3>
              <p>It improves transparency, trust, and usability in high-friction service journeys.</p>
            </article>
          </div>
        </section>

        <section id="process" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">How the portal works</span>
            <h2>A guided path from request to completion.</h2>
          </div>

          <div className="timeline-grid">
            {processSteps.map((step, index) => (
              <div className="timeline-card" key={step}>
                <span className="timeline-number">0{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">Capabilities</span>
            <h2>Designed for both citizen and admin workflows.</h2>
          </div>

          <div className="dual-grid">
            {capabilityData.map((item) => (
              <article className="glass-block capability-card" key={item.title}>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">Trust & value</span>
            <h2>Why users should trust the platform.</h2>
          </div>

          <div className="triple-grid">
            <article className="glass-block">
              <h3>Clear service design</h3>
              <p>Users quickly understand where to go, what to do, and what happens next.</p>
            </article>
            <article className="glass-block">
              <h3>Structured digital workflow</h3>
              <p>Documents, validation, status updates, and service progress follow a readable path.</p>
            </article>
            <article className="glass-block">
              <h3>Industry-ready presentation</h3>
              <p>The portal feels modern, premium, and suitable for evaluator-level demonstration.</p>
            </article>
          </div>
        </section>

        <section className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">Highlights</span>
            <h2>Quick KPI-style service indicators.</h2>
          </div>

          <div className="stats-grid-full">
            <article className="stat-box">
              <strong>10+</strong>
              <span>Core modules</span>
            </article>
            <article className="stat-box">
              <strong>06</strong>
              <span>Primary service lanes</span>
            </article>
            <article className="stat-box">
              <strong>02</strong>
              <span>Main user roles</span>
            </article>
            <article className="stat-box">
              <strong>24/7</strong>
              <span>Digital service presence</span>
            </article>
          </div>
        </section>

        <section id="updates" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">Latest updates</span>
            <h2>Announcement-ready update cards.</h2>
          </div>

          <div className="triple-grid">
            {updates.map((item) => (
              <article className="glass-block update-card" key={item.title}>
                <span className="mini-label">Update</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">FAQ / Quick help</span>
            <h2>Helpful answers for first-time users.</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <details className="faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="content-section section-inner reveal">
          <div className="section-head">
            <span className="section-chip">Contact us</span>
            <h2>Support and communication channels.</h2>
            <p>
              Use these contact blocks to present support-first guidance for citizens,
              service desk communication, and admin-side coordination.
            </p>
          </div>

          <div className="triple-grid">
            <article className="glass-block">
              <h3>Support Desk</h3>
              <p>Email: support@vrot.gov</p>
              <p>Phone: +91 90000 00000</p>
            </article>
            <article className="glass-block">
              <h3>Citizen Help</h3>
              <p>Application support for registration, transfer, RC, NOC, and related workflows.</p>
            </article>
            <article className="glass-block">
              <h3>Admin Coordination</h3>
              <p>Operational assistance for request handling, verification, and processing support.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer full-width-section">
        <div className="section-inner footer-inner">
          <div className="footer-brand">
            <h3>VROT</h3>
            <p>
              Vehicle Registration & Ownership Transfer platform for trusted,
              clear, and modern public service delivery.
            </p>
            <span className="footer-trust">
              Trusted digital governance experience for citizen-facing vehicle services.
            </span>
          </div>

          <div className="footer-links">
            <div>
              <h4>About Us</h4>
              {footerGroups.about.map((item) => (
                <a href="/" key={item}>{item}</a>
              ))}
            </div>
            <div>
              <h4>Services</h4>
              {footerGroups.services.map((item) => (
                <a href="/" key={item}>{item}</a>
              ))}
            </div>
            <div>
              <h4>Help / Support</h4>
              {footerGroups.support.map((item) => (
                <a href="/" key={item}>{item}</a>
              ))}
            </div>
            <div>
              <h4>Legal</h4>
              {footerGroups.legal.map((item) => (
                <a href="/" key={item}>{item}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="section-inner footer-bottom">
          <p>© 2026 VROT. All rights reserved.</p>
          <p>Vehicle Registration & Ownership Transfer | Digital governance service interface</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;