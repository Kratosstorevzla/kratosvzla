'use client';

import { PaymentInfo } from '@/lib/types';

interface Props {
  paymentInfo: PaymentInfo | null;
}

export default function PaymentSection({ paymentInfo }: Props) {
  const defaultPayment: PaymentInfo = {
    bank: 'Banco de Venezuela',
    phone: '0414-585-1705',
    cedula: 'V-00.000.000',
    holderName: 'Kratos Store',
  };

  const info = paymentInfo || defaultPayment;

  return (
    <section id="pagos" className="payment-section">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Métodos de Pago</span>
          <h2 className="section-title">Pago Móvil</h2>
          <p className="section-subtitle">
            Realiza tu pago de forma rápida y segura mediante pago móvil
          </p>
        </div>

        <div className="payment-wrapper">
          {/* Card */}
          <div className="payment-card">
            <div className="payment-card-header">
              <div className="payment-card-logo">
                <span>💳</span>
                <span>Pago Móvil</span>
              </div>
              <div className="payment-card-badge">Venezuela</div>
            </div>

            <div className="payment-fields">
              <div className="payment-field">
                <span className="payment-field-label">Banco</span>
                <span className="payment-field-value">{info.bank}</span>
              </div>
              <div className="payment-field">
                <span className="payment-field-label">Teléfono</span>
                <span className="payment-field-value payment-copy" onClick={() => navigator.clipboard?.writeText(info.phone)}>
                  {info.phone}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </span>
              </div>
              <div className="payment-field">
                <span className="payment-field-label">Cédula / RIF</span>
                <span className="payment-field-value payment-copy" onClick={() => navigator.clipboard?.writeText(info.cedula)}>
                  {info.cedula}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </span>
              </div>
              <div className="payment-field">
                <span className="payment-field-label">Titular</span>
                <span className="payment-field-value">{info.holderName}</span>
              </div>
            </div>

            <div className="payment-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Después de realizar el pago, envía el comprobante por WhatsApp para confirmar tu pedido.
            </div>
          </div>

          {/* Info */}
          <div className="payment-info-panel">
            <h3 className="panel-title">¿Cómo realizar tu compra?</h3>
            <div className="steps-list">
              {[
                { num: '01', text: 'Elige tu producto y escríbenos por WhatsApp' },
                { num: '02', text: 'Realiza el pago móvil con los datos de la izquierda' },
                { num: '03', text: 'Envía el comprobante de pago al WhatsApp' },
                { num: '04', text: 'Confirmamos y procesamos tu pedido' },
                { num: '05', text: '¡Recibe tu producto en casa!' },
              ].map((step) => (
                <div key={step.num} className="step-item">
                  <div className="step-num">{step.num}</div>
                  <p className="step-text">{step.text}</p>
                </div>
              ))}
            </div>
            <a
              href="https://wa.me/584145851705?text=Hola!%20Acabo%20de%20realizar%20el%20pago%20móvil%20y%20quiero%20enviar%20el%20comprobante."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ marginTop: '28px', display: 'inline-flex', width: '100%', justifyContent: 'center' }}
            >
              Enviar Comprobante
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-section {
          padding: 80px 0;
          background: var(--white);
        }
        .payment-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          max-width: 900px;
          margin: 0 auto;
        }
        .payment-card {
          background: var(--gray-900);
          border-radius: var(--radius-xl);
          padding: 36px;
          color: var(--white);
        }
        .payment-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .payment-card-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
        }
        .payment-card-badge {
          background: rgba(255,255,255,0.12);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
        }
        .payment-fields {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .payment-field {
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 16px;
        }
        .payment-field:last-child { border-bottom: none; }
        .payment-field-label {
          display: block;
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .payment-field-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--white);
        }
        .payment-copy {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .payment-copy:hover { opacity: 0.7; }
        .payment-note {
          display: flex;
          gap: 10px;
          margin-top: 28px;
          padding: 16px;
          background: rgba(255,255,255,0.07);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.5;
        }
        .panel-title {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 28px;
        }
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .step-num {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          background: var(--black);
          color: var(--white);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }
        .step-text {
          font-size: 14px;
          color: var(--gray-600);
          padding-top: 8px;
          line-height: 1.5;
        }
        @media (max-width: 768px) {
          .payment-wrapper { grid-template-columns: 1fr; }
          .payment-card { padding: 24px; }
        }
      `}</style>
    </section>
  );
}
