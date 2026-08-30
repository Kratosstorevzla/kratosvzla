'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir
    const auth = sessionStorage.getItem('espartano_admin_auth');
    if (auth === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pequeño delay para efecto visual
    setTimeout(() => {
      const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Rolo2026*';
      if (password === correctPassword) {
        sessionStorage.setItem('espartano_admin_auth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Contraseña incorrecta. Intenta nuevamente.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Image
              src="/isotipo-espartano-white.png"
              alt=""
              width={278}
              height={560}
              priority
            />
          </div>
          <div className="login-logo-text">
            <span className="login-logo-name">ESPARTANO</span>
            <span className="login-logo-sub">Portal Administrador</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña de acceso
            </label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="Ingresa la contraseña..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="show-pass-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading || !password}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Ingresar al panel
              </>
            )}
          </button>
        </form>

        <a href="/" className="back-to-store">
          ← Volver a la tienda
        </a>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          background: var(--gray-50);
        }
        .login-bg {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 30% 50%, rgba(0,0,0,0.04) 0%, transparent 60%),
                      radial-gradient(circle at 70% 30%, rgba(0,0,0,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
        .login-card {
          position: relative;
          background: var(--white);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          padding: 48px;
          width: 100%;
          max-width: 420px;
          border: 1px solid var(--gray-150);
        }
        .login-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }
        .login-logo-icon {
          width: 52px;
          height: 52px;
          background: var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .login-logo-icon :global(img) {
          height: 34px;
          width: auto;
          display: block;
        }
        .login-logo-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .login-logo-name {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 700;
          color: var(--gray-900);
          letter-spacing: 0.06em;
        }
        .login-logo-sub {
          font-size: 12px;
          color: var(--gray-500);
          letter-spacing: 0.08em;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .password-input-wrap {
          position: relative;
        }
        .password-input-wrap .form-input {
          padding-right: 48px;
        }
        .show-pass-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
          transition: color 0.2s;
        }
        .show-pass-btn:hover { color: var(--black); }
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #c0392b;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
        }
        .login-submit {
          background: var(--black);
          color: var(--white);
          padding: 14px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: var(--transition);
          border: none;
          cursor: pointer;
        }
        .login-submit:hover:not(:disabled) {
          background: var(--gray-800);
          transform: translateY(-1px);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: var(--white);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .back-to-store {
          display: block;
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--gray-500);
          transition: color 0.2s;
          text-decoration: none;
        }
        .back-to-store:hover { color: var(--black); }
        @media (max-width: 480px) {
          .login-card { padding: 32px 24px; }
        }
      `}</style>
    </div>
  );
}
