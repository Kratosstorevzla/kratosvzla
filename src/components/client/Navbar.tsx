'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-k">K</span>RATOS
          <span className="logo-store"> STORE</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="navbar-links">
          <li><a href="#catalogo">Catálogo</a></li>
          <li><a href="#delivery">Envíos</a></li>
          <li><a href="#pagos">Pagos</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          <a
            href="https://wa.me/584145851705"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary navbar-cta"
          >
            Comprar Ahora
          </a>

          {/* Hamburger */}
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <a href="#catalogo" onClick={() => setMenuOpen(false)}>Catálogo</a>
        <a href="#delivery" onClick={() => setMenuOpen(false)}>Envíos</a>
        <a href="#pagos" onClick={() => setMenuOpen(false)}>Pagos</a>
        <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
      </div>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: var(--transition);
        }
        .navbar-scrolled {
          border-bottom-color: var(--gray-200);
          box-shadow: var(--shadow-sm);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }
        .navbar-logo {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 0.06em;
          color: var(--black);
          text-decoration: none;
        }
        .logo-k {
          font-size: 28px;
          color: var(--black);
        }
        .logo-store {
          font-size: 14px;
          font-family: var(--font-sans);
          font-weight: 300;
          letter-spacing: 0.2em;
          color: var(--gray-600);
        }
        .navbar-links {
          display: flex;
          list-style: none;
          gap: 36px;
        }
        .navbar-links a {
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--gray-700);
          transition: color 0.2s;
        }
        .navbar-links a:hover {
          color: var(--black);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .navbar-cta {
          font-size: 12px !important;
          padding: 8px 18px !important;
        }
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 28px;
          cursor: pointer;
          background: none;
          border: none;
        }
        .hamburger span {
          display: block;
          height: 2px;
          background: var(--black);
          transition: var(--transition);
          border-radius: 2px;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .mobile-menu {
          display: none;
          flex-direction: column;
          background: var(--white);
          padding: 16px 24px 24px;
          gap: 20px;
          border-top: 1px solid var(--gray-200);
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        .mobile-menu.open {
          display: flex;
          max-height: 300px;
        }
        .mobile-menu a {
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-700);
          letter-spacing: 0.04em;
        }
        @media (max-width: 900px) {
          .navbar-links { display: none; }
          .hamburger { display: flex; }
          .navbar-cta { display: none; }
        }
      `}</style>
    </nav>
  );
}
