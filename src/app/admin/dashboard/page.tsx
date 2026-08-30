'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllProductsAdmin } from '@/lib/firebaseUtils';

export default function DashboardHomePage() {
  const [productCount, setProductCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProductsAdmin().then((products) => {
      setProductCount(products.length);
      setPublishedCount(products.filter((p) => p.status === 'published').length);
      setDraftCount(products.filter((p) => p.status === 'draft').length);
      setLoading(false);
    });
  }, []);

  const quickActions = [
    {
      href: '/admin/dashboard/products',
      title: 'Subir Productos',
      description: 'Carga masiva de imágenes y edita la información de cada producto',
      icon: '📦',
      color: '#000',
    },
    {
      href: '/admin/dashboard/content',
      title: 'Editar Contenido',
      description: 'Modifica textos, imágenes y secciones de la página principal',
      icon: '✏️',
      color: '#333',
    },
    {
      href: '/admin/dashboard/payments',
      title: 'Datos de Pago',
      description: 'Actualiza la información de pago móvil que se muestra a los clientes',
      icon: '💳',
      color: '#555',
    },
  ];

  return (
    <div className="dash-home">
      <div className="dash-welcome">
        <h1 className="dash-welcome-title">Bienvenido al Panel de Control</h1>
        <p className="dash-welcome-sub">
          Gestiona todos los aspectos de Espartano desde aquí.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">📦</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{loading ? '...' : productCount}</div>
            <div className="stat-card-label">Total productos</div>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-card-icon">✅</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{loading ? '...' : publishedCount}</div>
            <div className="stat-card-label">Publicados</div>
          </div>
        </div>
        <div className="stat-card stat-card-gray">
          <div className="stat-card-icon">📝</div>
          <div className="stat-card-body">
            <div className="stat-card-num">{loading ? '...' : draftCount}</div>
            <div className="stat-card-label">Borradores</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">📱</div>
          <div className="stat-card-body">
            <div className="stat-card-num">+58</div>
            <div className="stat-card-label">WhatsApp activo</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="section-heading">Acciones Rápidas</h2>
      <div className="quick-actions-grid">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="quick-action-card">
            <div className="quick-action-icon" style={{ background: action.color }}>
              {action.icon}
            </div>
            <div>
              <div className="quick-action-title">{action.title}</div>
              <div className="quick-action-desc">{action.description}</div>
            </div>
            <svg
              className="quick-action-arrow"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Tips */}
      <div className="tips-panel">
        <h3 className="tips-title">💡 Guía rápida de uso</h3>
        <ol className="tips-list">
          <li>Ve a <strong>Productos</strong> y haz clic en <em>&quot;Subida Masiva&quot;</em> para cargar tus imágenes.</li>
          <li>Después de subir, edita el <strong>nombre, precio y descripción</strong> de cada producto.</li>
          <li>Cambia el estado a <strong>Publicado</strong> para que aparezca en la tienda.</li>
          <li>Usa <strong>Editar Contenido</strong> para cambiar textos del hero, delivery y categorías.</li>
          <li>Actualiza los <strong>Datos de Pago</strong> cuando sea necesario.</li>
        </ol>
      </div>

      <style jsx>{`
        .dash-home { display: flex; flex-direction: column; gap: 28px; }
        .dash-welcome-title {
          font-family: var(--font-serif);
          font-size: 26px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 6px;
        }
        .dash-welcome-sub { font-size: 15px; color: var(--gray-500); }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .stat-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .stat-card-icon { font-size: 32px; }
        .stat-card-num {
          font-size: 28px;
          font-weight: 800;
          color: var(--gray-900);
          line-height: 1;
        }
        .stat-card-label { font-size: 13px; color: var(--gray-500); margin-top: 4px; }
        .section-heading {
          font-size: 17px;
          font-weight: 700;
          color: var(--gray-900);
          margin-top: 4px;
        }
        .quick-actions-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        :global(.quick-action-card) {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          text-decoration: none;
          transition: var(--transition);
        }
        :global(.quick-action-card:hover) {
          border-color: var(--black);
          box-shadow: var(--shadow-md);
          transform: translateX(4px);
        }
        .quick-action-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .quick-action-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 3px;
        }
        .quick-action-desc { font-size: 13px; color: var(--gray-500); }
        .quick-action-arrow { margin-left: auto; color: var(--gray-400); }
        .tips-panel {
          background: var(--gray-50);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .tips-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--gray-900);
          margin-bottom: 16px;
        }
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-left: 20px;
        }
        .tips-list li { font-size: 14px; color: var(--gray-600); line-height: 1.6; }
        .tips-list strong { color: var(--gray-900); }
      `}</style>
    </div>
  );
}
