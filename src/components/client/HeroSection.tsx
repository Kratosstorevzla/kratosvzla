'use client';

import { SiteContent } from '@/lib/types';
import { BRAND_NAME } from '@/lib/brand';

interface Props {
  content: SiteContent;
}

export default function HeroSection({ content }: Props) {
  const { hero } = content;

  return (
    <section className="hero-section" style={{ marginTop: '112px' }}>
      {/* Background */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: hero.backgroundImage
            ? `url(${hero.backgroundImage})`
            : 'none',
        }}
      >
        <div className="hero-overlay" />
      </div>

      {/* Content */}
      <div className="hero-content container">
        <div className="hero-badge">Nueva Colección 2025</div>

        <h1 className="hero-title">
          {BRAND_NAME.split(' ').map((word, i) => (
            <span
              key={i}
              className="hero-word"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              {word}&nbsp;
            </span>
          ))}
        </h1>

        <p className="hero-subtitle">{hero.subtitle}</p>

        <div className="hero-actions">
          <a href="#catalogo" className="btn-primary hero-btn-main">
            {hero.ctaText}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            href="https://wa.me/584145851705"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary hero-btn-secondary"
          >
            Contactar por WhatsApp
          </a>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-num">500+</span>
            <span className="stat-label">Productos</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">100%</span>
            <span className="stat-label">Calidad</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">🚚</span>
            <span className="stat-label">Delivery</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          min-height: 88vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          background-color: var(--gray-900);
          background-size: cover;
          background-position: center;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.88) 0%,
            rgba(0,0,0,0.5) 60%,
            rgba(0,0,0,0.35) 100%
          );
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding-top: 60px;
          padding-bottom: 60px;
        }
        .hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--white);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: var(--radius-full);
          margin-bottom: 28px;
          animation: fadeInUp 0.5s ease forwards;
        }
        .hero-title {
          font-family: var(--font-serif);
          font-size: clamp(44px, 8vw, 96px);
          font-weight: 900;
          color: var(--white);
          line-height: 1.05;
          margin-bottom: 24px;
          max-width: 700px;
        }
        .hero-word {
          display: inline-block;
          opacity: 0;
          animation: fadeInUp 0.6s ease forwards;
        }
        .hero-subtitle {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(255,255,255,0.72);
          max-width: 500px;
          margin-bottom: 44px;
          line-height: 1.7;
          animation: fadeInUp 0.6s 0.3s ease forwards;
          opacity: 0;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 60px;
          animation: fadeInUp 0.6s 0.45s ease forwards;
          opacity: 0;
        }
        .hero-btn-main {
          background: var(--white) !important;
          color: var(--black) !important;
          border-color: var(--white) !important;
          font-size: 13px !important;
          padding: 14px 32px !important;
        }
        .hero-btn-main:hover {
          background: var(--gray-100) !important;
        }
        .hero-btn-secondary {
          border-color: rgba(255,255,255,0.5) !important;
          color: var(--white) !important;
          font-size: 13px !important;
          padding: 14px 32px !important;
        }
        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.1) !important;
          border-color: var(--white) !important;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 32px;
          animation: fadeInUp 0.6s 0.6s ease forwards;
          opacity: 0;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-num {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 700;
          color: var(--white);
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.2);
        }
        @media (max-width: 768px) {
          .hero-actions { flex-direction: column; align-items: flex-start; }
          .hero-btn-main, .hero-btn-secondary { width: 100%; justify-content: center; }
          .hero-stats { gap: 20px; }
          .stat-num { font-size: 22px; }
        }
      `}</style>
    </section>
  );
}
