import Image from 'next/image';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-mark">
                <Image
                  src="/isotipo-espartano-white.png"
                  alt=""
                  width={278}
                  height={560}
                />
              </span>
              <span className="footer-logo-text">
                <span className="footer-logo-word">ESPARTANO</span>
                <span className="footer-logo-tag">STORE VZLA</span>
              </span>
            </div>
            <p className="footer-tagline">
              Accesorios premium para el caballero moderno. Calidad, estilo y distinción en cada producto.
            </p>
            <div className="footer-social">
              <a
                href="https://wa.me/584145851705"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-col">
            <h4 className="footer-col-title">Navegación</h4>
            <ul className="footer-links">
              <li><a href="#catalogo">Catálogo</a></li>
              <li><a href="#delivery">Envíos</a></li>
              <li><a href="#pagos">Pagos</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contacto</h4>
            <ul className="footer-links">
              <li>
                <a href="https://wa.me/584145851705" target="_blank" rel="noopener noreferrer">
                  📱 +58 414-585-1705
                </a>
              </li>
              <li><span>🚚 Delivery a todo el país</span></li>
              <li><span>⏰ Lun–Sáb: 8am–6pm</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Espartano Store VZLA. Todos los derechos reservados.</p>
          <a href="/admin" className="admin-link">Admin</a>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: var(--gray-900);
          color: var(--white);
          padding: 64px 0 32px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 16px;
        }
        .footer-logo-mark {
          display: block;
          height: 54px;
        }
        .footer-logo-mark :global(img) {
          height: 100%;
          width: auto;
          display: block;
        }
        .footer-logo-word {
          font-family: var(--font-serif);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 0.12em;
          line-height: 1;
          color: var(--white);
        }
        .footer-logo-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .footer-logo-tag {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 0.3em;
          line-height: 1;
          color: var(--gray-500);
        }
        .footer-tagline {
          font-size: 14px;
          color: var(--gray-500);
          line-height: 1.7;
          max-width: 300px;
          margin-bottom: 24px;
        }
        .footer-social {
          display: flex;
          gap: 12px;
        }
        .social-link {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--white);
          transition: var(--transition);
        }
        .social-link:hover {
          background: #25d366;
          transform: scale(1.1);
        }
        .footer-col-title {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--gray-400);
          margin-bottom: 20px;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-links a,
        .footer-links span {
          font-size: 14px;
          color: var(--gray-500);
          transition: color 0.2s;
          text-decoration: none;
        }
        .footer-links a:hover { color: var(--white); }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-bottom p {
          font-size: 13px;
          color: var(--gray-600);
        }
        .admin-link {
          font-size: 12px;
          color: var(--gray-700);
          letter-spacing: 0.08em;
          transition: color 0.2s;
          text-decoration: none;
        }
        .admin-link:hover { color: var(--gray-400); }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
        }
      `}</style>
    </footer>
  );
}
