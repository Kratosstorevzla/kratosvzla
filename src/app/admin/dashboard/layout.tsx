'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/products',
    label: 'Productos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/content',
    label: 'Contenido',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  {
    href: '/admin/dashboard/payments',
    label: 'Pagos Móvil',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem('kratos_admin_auth');
    if (auth !== 'true') {
      router.replace('/admin');
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('kratos_admin_auth');
    router.push('/admin');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">K</div>
            <div>
              <div className="sidebar-logo-name">KRATOS</div>
              <div className="sidebar-logo-sub">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link href="/" className="sidebar-store-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Ver tienda
          </Link>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-topbar">
          <button
            className="topbar-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="topbar-title">
            {navItems.find((n) =>
              n.href === '/admin/dashboard'
                ? pathname === '/admin/dashboard'
                : pathname.startsWith(n.href)
            )?.label || 'Dashboard'}
          </div>
          <div className="topbar-badge">Admin</div>
        </header>

        <main className="dashboard-content">{children}</main>
      </div>

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--gray-50);
        }
        .sidebar {
          width: 260px;
          background: var(--white);
          border-right: 1px solid var(--gray-200);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          flex-shrink: 0;
          z-index: 100;
          transition: var(--transition);
        }
        .sidebar-header {
          padding: 24px 20px;
          border-bottom: 1px solid var(--gray-100);
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sidebar-logo-icon {
          width: 42px;
          height: 42px;
          background: var(--black);
          color: var(--white);
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .sidebar-logo-name {
          font-family: var(--font-serif);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--gray-900);
        }
        .sidebar-logo-sub {
          font-size: 11px;
          color: var(--gray-500);
          letter-spacing: 0.08em;
        }
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        :global(.sidebar-nav-item) {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 500;
          color: var(--gray-600);
          text-decoration: none;
          transition: var(--transition);
        }
        :global(.sidebar-nav-item:hover) {
          background: var(--gray-50);
          color: var(--gray-900);
        }
        :global(.sidebar-nav-item.active) {
          background: var(--black);
          color: var(--white);
        }
        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid var(--gray-100);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        :global(.sidebar-store-btn) {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-600);
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: var(--transition);
        }
        :global(.sidebar-store-btn:hover) { background: var(--gray-50); color: var(--gray-900); }
        .sidebar-logout-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          color: #c0392b;
          background: none;
          border: none;
          cursor: pointer;
          transition: var(--transition);
          width: 100%;
          text-align: left;
        }
        .sidebar-logout-btn:hover { background: #fef2f2; }
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 99;
        }
        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .dashboard-topbar {
          background: var(--white);
          border-bottom: 1px solid var(--gray-200);
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .topbar-hamburger {
          display: none;
          padding: 8px;
          border-radius: var(--radius-md);
          color: var(--gray-700);
          transition: var(--transition);
        }
        .topbar-hamburger:hover { background: var(--gray-100); }
        .topbar-title {
          flex: 1;
          font-size: 16px;
          font-weight: 600;
          color: var(--gray-900);
        }
        .topbar-badge {
          background: var(--black);
          color: var(--white);
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          letter-spacing: 0.08em;
        }
        .dashboard-content {
          flex: 1;
          padding: 28px;
          overflow-y: auto;
        }
        @media (max-width: 900px) {
          .sidebar {
            position: fixed;
            left: -260px;
            top: 0;
            height: 100vh;
          }
          .sidebar.open {
            left: 0;
            box-shadow: var(--shadow-xl);
          }
          .sidebar-overlay {
            display: block;
          }
          .topbar-hamburger {
            display: flex;
          }
          .dashboard-content {
            padding: 20px 16px;
          }
        }
      `}</style>
    </div>
  );
}
