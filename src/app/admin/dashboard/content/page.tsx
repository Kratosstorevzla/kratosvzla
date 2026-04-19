'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSiteContent, updateSiteContent } from '@/lib/firebaseUtils';
import { SiteContent } from '@/lib/types';
import { defaultSiteContent } from '@/lib/firebaseUtils';

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'transparent', color: 'inherit', fontSize: '18px' }}>×</button>
    </div>
  );
}

export default function ContentEditorPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'bar' | 'delivery' | 'categories'>('hero');
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);

  const addToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
  }, []);

  useEffect(() => {
    getSiteContent().then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteContent(content);
      addToast('✅ Contenido actualizado. Los cambios son visibles en la tienda.');
    } catch {
      addToast('Error al guardar. Verifica la conexión con Firebase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: string, value: string) => {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateBar = (field: string, value: unknown) => {
    setContent((prev) => ({ ...prev, announcementBar: { ...prev.announcementBar, [field]: value } }));
  };

  const updateDelivery = (field: string, value: unknown) => {
    setContent((prev) => ({ ...prev, delivery: { ...prev.delivery, [field]: value } }));
  };

  const updateFeature = (idx: number, field: string, value: string) => {
    const features = [...content.delivery.features];
    features[idx] = { ...features[idx], [field]: value };
    setContent((prev) => ({ ...prev, delivery: { ...prev.delivery, features } }));
  };

  const addFeature = () => {
    const features = [...content.delivery.features, { icon: '📦', title: 'Título', description: 'Descripción' }];
    setContent((prev) => ({ ...prev, delivery: { ...prev.delivery, features } }));
  };

  const removeFeature = (idx: number) => {
    const features = content.delivery.features.filter((_, i) => i !== idx);
    setContent((prev) => ({ ...prev, delivery: { ...prev.delivery, features } }));
  };

  const updateBarMessage = (idx: number, value: string) => {
    const messages = [...content.announcementBar.messages];
    messages[idx] = value;
    updateBar('messages', messages);
  };

  const addBarMessage = () => {
    updateBar('messages', [...content.announcementBar.messages, 'Nuevo mensaje...']);
  };

  const removeBarMessage = (idx: number) => {
    updateBar('messages', content.announcementBar.messages.filter((_, i) => i !== idx));
  };

  const updateCategory = (idx: number, value: string) => {
    const categories = [...content.categories];
    categories[idx] = value;
    setContent((prev) => ({ ...prev, categories }));
  };

  const addCategory = () => {
    setContent((prev) => ({ ...prev, categories: [...prev.categories, 'Nueva categoría'] }));
  };

  const removeCategory = (idx: number) => {
    setContent((prev) => ({ ...prev, categories: prev.categories.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 52, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  const tabs = [
    { id: 'hero', label: '🏠 Hero' },
    { id: 'bar', label: '📢 Anuncios' },
    { id: 'delivery', label: '🚚 Delivery' },
    { id: 'categories', label: '🏷️ Categorías' },
  ] as const;

  return (
    <div className="content-page">
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>

      <div className="content-header">
        <h1 className="page-title">Editor de Contenido</h1>
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

      <p className="content-desc">
        Los cambios se reflejan en tiempo real en la tienda al guardar.
      </p>

      {/* Tabs */}
      <div className="content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`content-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-panel">
        {/* ── HERO ── */}
        {activeTab === 'hero' && (
          <div className="editor-section">
            <h2 className="editor-section-title">Sección Hero (Portada)</h2>
            <div className="editor-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Título principal</label>
                <input
                  className="form-input"
                  value={content.hero.title}
                  onChange={(e) => updateHero('title', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Subtítulo</label>
                <input
                  className="form-input"
                  value={content.hero.subtitle}
                  onChange={(e) => updateHero('subtitle', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Texto del botón CTA</label>
                <input
                  className="form-input"
                  value={content.hero.ctaText}
                  onChange={(e) => updateHero('ctaText', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL de imagen de fondo (opcional)</label>
                <input
                  className="form-input"
                  value={content.hero.backgroundImage}
                  onChange={(e) => updateHero('backgroundImage', e.target.value)}
                  placeholder="https://... (deja vacío para fondo negro)"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENT BAR ── */}
        {activeTab === 'bar' && (
          <div className="editor-section">
            <h2 className="editor-section-title">Barra de Anuncios</h2>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={content.announcementBar.isVisible}
                  onChange={(e) => updateBar('isVisible', e.target.checked)}
                />
                <span>Mostrar barra de anuncios</span>
              </label>
            </div>
            <div className="list-editor">
              {content.announcementBar.messages.map((msg, i) => (
                <div key={i} className="list-item">
                  <input
                    className="form-input"
                    value={msg}
                    onChange={(e) => updateBarMessage(i, e.target.value)}
                  />
                  <button className="list-remove-btn" onClick={() => removeBarMessage(i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={addBarMessage}>
                + Agregar mensaje
              </button>
            </div>
          </div>
        )}

        {/* ── DELIVERY ── */}
        {activeTab === 'delivery' && (
          <div className="editor-section">
            <h2 className="editor-section-title">Sección Delivery</h2>
            <div className="editor-grid" style={{ marginBottom: '24px' }}>
              <div className="form-group">
                <label className="form-label">Título</label>
                <input
                  className="form-input"
                  value={content.delivery.title}
                  onChange={(e) => updateDelivery('title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subtítulo</label>
                <input
                  className="form-input"
                  value={content.delivery.subtitle}
                  onChange={(e) => updateDelivery('subtitle', e.target.value)}
                />
              </div>
            </div>

            <h3 className="editor-subsection-title">Características</h3>
            <div className="features-list">
              {content.delivery.features.map((feature, i) => (
                <div key={i} className="feature-editor">
                  <div className="feature-editor-header">
                    <span>Característica {i + 1}</span>
                    <button className="list-remove-btn" onClick={() => removeFeature(i)}>×</button>
                  </div>
                  <div className="editor-grid">
                    <div className="form-group">
                      <label className="form-label">Icono (emoji)</label>
                      <input
                        className="form-input"
                        value={feature.icon}
                        onChange={(e) => updateFeature(i, 'icon', e.target.value)}
                        style={{ fontSize: '20px' }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Título</label>
                      <input
                        className="form-input"
                        value={feature.title}
                        onChange={(e) => updateFeature(i, 'title', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Descripción</label>
                      <input
                        className="form-input"
                        value={feature.description}
                        onChange={(e) => updateFeature(i, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button className="list-add-btn" onClick={addFeature}>
                + Agregar característica
              </button>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {activeTab === 'categories' && (
          <div className="editor-section">
            <h2 className="editor-section-title">Categorías del Catálogo</h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Estas categorías aparecen como filtros en el catálogo de la tienda.
            </p>
            <div className="list-editor">
              {content.categories.map((cat, i) => (
                <div key={i} className="list-item">
                  <input
                    className="form-input"
                    value={cat}
                    onChange={(e) => updateCategory(i, e.target.value)}
                  />
                  <button className="list-remove-btn" onClick={() => removeCategory(i)}>×</button>
                </div>
              ))}
              <button className="list-add-btn" onClick={addCategory}>
                + Agregar categoría
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .content-page { display: flex; flex-direction: column; gap: 20px; }
        .content-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
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
        .content-desc { font-size: 14px; color: var(--gray-500); margin-top: -8px; }
        .content-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .content-tab {
          padding: 9px 18px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid var(--gray-200);
          background: var(--white);
          color: var(--gray-600);
          cursor: pointer;
          transition: var(--transition);
        }
        .content-tab:hover { border-color: var(--black); color: var(--black); }
        .content-tab.active { background: var(--black); color: var(--white); border-color: var(--black); }
        .tab-panel {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-xl);
          padding: 28px;
        }
        .editor-section { display: flex; flex-direction: column; gap: 20px; }
        .editor-section-title { font-size: 17px; font-weight: 700; color: var(--gray-900); }
        .editor-subsection-title { font-size: 14px; font-weight: 600; color: var(--gray-700); letter-spacing: 0.04em; text-transform: uppercase; }
        .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .toggle-row { display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; color: var(--gray-700); cursor: pointer; }
        .toggle-row input { width: 18px; height: 18px; cursor: pointer; }
        .list-editor { display: flex; flex-direction: column; gap: 8px; }
        .list-item { display: flex; gap: 8px; align-items: center; }
        .list-item .form-input { flex: 1; }
        .list-remove-btn {
          width: 32px; height: 32px; min-width: 32px;
          border-radius: 50%;
          background: var(--gray-100);
          color: var(--gray-600);
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          flex-shrink: 0;
        }
        .list-remove-btn:hover { background: #fef2f2; color: #c0392b; }
        .list-add-btn {
          padding: 9px 16px;
          border: 1.5px dashed var(--gray-300);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-500);
          background: var(--gray-50);
          cursor: pointer;
          transition: var(--transition);
          text-align: left;
        }
        .list-add-btn:hover { border-color: var(--black); color: var(--black); background: var(--white); }
        .features-list { display: flex; flex-direction: column; gap: 12px; }
        .feature-editor {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 16px;
        }
        .feature-editor-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
          font-size: 13px; font-weight: 600; color: var(--gray-700);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          .editor-grid { grid-template-columns: 1fr; }
          .editor-grid > * { grid-column: 1 !important; }
        }
      `}</style>
    </div>
  );
}
