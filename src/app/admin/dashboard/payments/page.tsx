'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPaymentInfo, updatePaymentInfo } from '@/lib/firebaseUtils';
import { PaymentInfo } from '@/lib/types';

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'transparent', color: 'inherit', fontSize: '18px' }}>×</button>
    </div>
  );
}

const VENEZUELAN_BANKS = [
  'Banco de Venezuela',
  'Banco Mercantil',
  'Banco Nacional de Crédito (BNC)',
  'Banesco',
  'BBVA Provincial',
  'Banco Bicentenario',
  'Banco del Tesoro',
  'Bancaribe',
  'BOD (Banco Occidental de Descuento)',
  'BanFanb',
  'Banco Activo',
  'Banco Exterior',
  'Banco Sofitasa',
  'Mi Banco',
  'Otro',
];

export default function PaymentsAdminPage() {
  const [form, setForm] = useState<PaymentInfo>({
    bank: 'Banco de Venezuela',
    phone: '0414-585-1705',
    cedula: 'V-00.000.000',
    holderName: 'Espartano',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);

  const addToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
  }, []);

  useEffect(() => {
    getPaymentInfo().then((info) => {
      if (info) setForm(info);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof PaymentInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.bank || !form.phone || !form.cedula || !form.holderName) {
      addToast('Completa todos los campos antes de guardar.', 'error');
      return;
    }
    setSaving(true);
    try {
      await updatePaymentInfo(form);
      addToast('✅ Datos de pago actualizados. Los cambios son visibles en la tienda.');
    } catch {
      addToast('Error al guardar. Verifica la conexión con Firebase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>

      <div className="payments-header">
        <h1 className="page-title">Información de Pago Móvil</h1>
        <button className="btn-primary save-btn" onClick={handleSave} disabled={saving}>
          {saving ? (
            <><span className="btn-spinner" /> Guardando...</>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Guardar cambios
            </>
          )}
        </button>
      </div>

      <p className="payments-desc">
        Esta información se muestra a tus clientes en la sección de pagos de la tienda.
        Los cambios son inmediatos al guardar.
      </p>

      <div className="payments-layout">
        {/* Form */}
        <div className="payments-form-card">
          <h2 className="form-card-title">Datos del Pago Móvil</h2>
          <div className="payments-form">
            <div className="form-group">
              <label className="form-label">Banco</label>
              <select
                className="form-select"
                value={form.bank}
                onChange={(e) => handleChange('bank', e.target.value)}
              >
                {VENEZUELAN_BANKS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Número de Teléfono</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0414-000-0000"
              />
              <span className="form-hint">Formato: 0414-000-0000</span>
            </div>

            <div className="form-group">
              <label className="form-label">Cédula / RIF del Titular</label>
              <input
                className="form-input"
                value={form.cedula}
                onChange={(e) => handleChange('cedula', e.target.value)}
                placeholder="V-00.000.000"
              />
              <span className="form-hint">Formato: V-00.000.000 o J-000000000</span>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre del Titular</label>
              <input
                className="form-input"
                value={form.holderName}
                onChange={(e) => handleChange('holderName', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="preview-panel">
          <h2 className="form-card-title">Vista previa</h2>
          <p className="preview-note">Así se verá en la tienda para los clientes:</p>

          <div className="payment-preview-card">
            <div className="preview-card-header">
              <div className="preview-card-logo">
                <span>💳</span>
                <span>Pago Móvil</span>
              </div>
              <div className="preview-badge">Venezuela</div>
            </div>

            <div className="preview-fields">
              <div className="preview-field">
                <span className="preview-label">Banco</span>
                <span className="preview-value">{form.bank || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">Teléfono</span>
                <span className="preview-value">{form.phone || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">Cédula / RIF</span>
                <span className="preview-value">{form.cedula || '—'}</span>
              </div>
              <div className="preview-field">
                <span className="preview-label">Titular</span>
                <span className="preview-value">{form.holderName || '—'}</span>
              </div>
            </div>

            <div className="preview-note-box">
              📌 Después de realizar el pago, envía el comprobante por WhatsApp para confirmar tu pedido.
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payments-page { display: flex; flex-direction: column; gap: 20px; }
        .payments-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .page-title { font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--gray-900); }
        .save-btn { display: inline-flex; align-items: center; gap: 8px; }
        .btn-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        .payments-desc { font-size: 14px; color: var(--gray-500); }
        .payments-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .payments-form-card, .preview-panel {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
          padding: 28px;
        }
        .form-card-title { font-size: 16px; font-weight: 700; color: var(--gray-900); margin-bottom: 20px; }
        .payments-form { display: flex; flex-direction: column; gap: 18px; }
        .form-hint { font-size: 12px; color: var(--gray-400); margin-top: 4px; display: block; }
        .preview-note { font-size: 13px; color: var(--gray-500); margin-bottom: 16px; }
        .payment-preview-card {
          background: var(--gray-900);
          border-radius: var(--radius-xl);
          padding: 28px;
          color: var(--white);
        }
        .preview-card-header {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;
        }
        .preview-card-logo { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; }
        .preview-badge {
          background: rgba(255,255,255,0.1);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 11px;
          color: rgba(255,255,255,0.6);
        }
        .preview-fields { display: flex; flex-direction: column; gap: 16px; }
        .preview-field { border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px; }
        .preview-field:last-child { border-bottom: none; }
        .preview-label { display: block; font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px; }
        .preview-value { font-size: 17px; font-weight: 600; }
        .preview-note-box { margin-top: 20px; padding: 14px; background: rgba(255,255,255,0.06); border-radius: var(--radius-md); font-size: 12px; color: rgba(255,255,255,0.55); line-height: 1.6; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .payments-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
