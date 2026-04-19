'use client';

import { SiteContent } from '@/lib/types';

interface Props {
  content: SiteContent;
}

export default function DeliverySection({ content }: Props) {
  const { delivery } = content;

  return (
    <section id="delivery" className="delivery-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Envíos & Delivery</span>
          <h2 className="section-title">{delivery.title}</h2>
          <p className="section-subtitle">{delivery.subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className="delivery-grid">
          {delivery.features.map((feature, i) => (
            <div key={i} className="delivery-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="delivery-icon">{feature.icon}</div>
              <h3 className="delivery-card-title">{feature.title}</h3>
              <p className="delivery-card-desc">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Banner */}
        <div className="delivery-banner">
          <div className="delivery-banner-content">
            <div className="delivery-banner-text">
              <h3>¿Tienes dudas sobre tu pedido?</h3>
              <p>Contáctanos por WhatsApp y te respondemos de inmediato</p>
            </div>
            <a
              href="https://wa.me/584145851705?text=Hola!%20Quisiera%20información%20sobre%20los%20envíos."
              target="_blank"
              rel="noopener noreferrer"
              className="delivery-banner-cta"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .delivery-section {
          padding: 80px 0;
          background: var(--gray-50);
        }
        .delivery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .delivery-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
          padding: 36px 28px;
          text-align: center;
          transition: var(--transition);
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }
        .delivery-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--black);
        }
        .delivery-icon {
          font-size: 44px;
          margin-bottom: 16px;
          display: block;
        }
        .delivery-card-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 8px;
        }
        .delivery-card-desc {
          font-size: 14px;
          color: var(--gray-500);
          line-height: 1.6;
        }
        .delivery-banner {
          background: var(--black);
          border-radius: var(--radius-xl);
          padding: 40px 48px;
        }
        .delivery-banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .delivery-banner-text h3 {
          font-family: var(--font-serif);
          font-size: 22px;
          color: var(--white);
          margin-bottom: 6px;
        }
        .delivery-banner-text p {
          font-size: 15px;
          color: rgba(255,255,255,0.65);
        }
        .delivery-banner-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #25d366;
          color: var(--white);
          padding: 14px 28px;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 14px;
          transition: var(--transition);
          white-space: nowrap;
          text-decoration: none;
        }
        .delivery-banner-cta:hover {
          background: #22c55e;
          transform: scale(1.03);
        }
        @media (max-width: 600px) {
          .delivery-banner { padding: 28px 20px; }
          .delivery-banner-content { flex-direction: column; align-items: flex-start; }
          .delivery-banner-cta { width: 100%; justify-content: center; }
        }
      `}</style>
    </section>
  );
}
