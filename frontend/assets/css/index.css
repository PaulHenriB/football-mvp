/* index.css - Homepage styles */
/* Extends global design system (styles.css) */

/* ===== Hero ===== */
.hero {
  text-align: center;
  padding: var(--space-xl) var(--space);
  background: linear-gradient(135deg, rgba(30,58,138,0.05), rgba(30,58,138,0.02));
}

.hero h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  margin-bottom: var(--space);
}

.hero .highlight {
  color: var(--color-primary);
}

.hero p {
  max-width: 640px;
  margin: 0 auto var(--space-lg);
  font-size: 1.125rem;
  color: var(--text-muted);
}

.cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-sm);
}

/* ===== Features ===== */
.features {
  padding: var(--space-xl) var(--space);
  text-align: center;
}

.features h2 {
  margin-bottom: var(--space-lg);
  font-weight: 700;
  color: var(--color-primary-dark);
}

.feature-grid {
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: 1fr;
}

.feature-card {
  background: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}

.feature-card:hover,
.feature-card:focus-within {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.feature-card i {
  color: var(--color-primary);
  margin-bottom: var(--space);
}

.feature-card h3 {
  margin-bottom: var(--space-sm);
  font-weight: 600;
}

.feature-card p {
  color: var(--text-muted);
  font-size: .95rem;
}

/* Responsive grids */
@media (min-width: 768px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1200px) {
  .feature-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* ===== CTA Banner ===== */
.cta-banner {
  background: var(--color-primary);
  color: var(--color-surface);
  text-align: center;
  padding: var(--space-xl) var(--space);
  border-radius: var(--radius);
  margin: var(--space-xl) auto;
  max-width: 960px;
}

.cta-banner h2 {
  margin-bottom: var(--space-sm);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.cta-banner p {
  margin-bottom: var(--space);
  color: rgba(255,255,255,0.9);
}

.cta-banner .btn-primary {
  background: var(--color-secondary);
  color: var(--text-default);
}
.cta-banner .btn-primary:hover,
.cta-banner .btn-primary:focus {
  background: var(--color-secondary-dark);
}

/* ===== Footer ===== */
footer {
  text-align: center;
  padding: var(--space-lg) var(--space);
  background: var(--color-surface);
  border-top: 1px solid rgba(15,23,42,0.05);
  color: var(--text-muted);
  font-size: var(--small);
}

/* ===== Hamburger Menu ===== */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 100%;
  background: var(--text-default);
  border-radius: 2px;
  transition: all var(--transition);
}

/* Default: nav hidden on mobile */
.nav-links {
  display: none;
  flex-direction: column;
  gap: var(--space-sm);
  position: absolute;
  top: 60px;
  right: var(--space);
  background: var(--color-surface);
  padding: var(--space);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.nav-links.nav-open {
  display: flex;
}

/* Desktop: nav inline, hide hamburger */
@media (min-width: 768px) {
  .hamburger {
    display: none;
  }

  .nav-links {
    display: flex !important;
    position: static;
    flex-direction: row;
    gap: var(--space-md);
    background: transparent;
    padding: 0;
    box-shadow: none;
  }
}
