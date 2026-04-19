'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';

interface Props {
  products: Product[];
  categories: string[];
}

function ProductCard({ product }: { product: Product }) {
  const [imgIdx, setImgIdx] = useState(0);
  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - (product.discount || 0) / 100)
    : product.price;

  return (
    <article className="product-card">
      {hasDiscount && (
        <div className="product-card-badge">-{product.discount}%</div>
      )}

      <div
        className="product-card-image"
        onMouseEnter={() => product.images.length > 1 && setImgIdx(1)}
        onMouseLeave={() => setImgIdx(0)}
      >
        {product.images.length > 0 ? (
          <img
            src={product.images[imgIdx] || product.images[0]}
            alt={product.name}
            loading="lazy"
          />
        ) : (
          <div className="product-no-image">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="product-card-body">
        <p className="product-card-category">{product.category}</p>
        <h3 className="product-card-name">{product.name}</h3>
        {product.description && (
          <p className="product-card-desc">{product.description}</p>
        )}
        <div className="product-card-price">
          <span className="price-current">
            ${discountedPrice.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </span>
          {hasDiscount && (
            <span className="price-original">
              ${product.price.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>

        <a
          href={`https://wa.me/584145851705?text=Hola!%20Me%20interesa%20el%20producto:%20${encodeURIComponent(product.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="product-cta btn-primary"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar
        </a>
      </div>

      <style jsx>{`
        .product-no-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-400);
          background: var(--gray-100);
        }
        .product-card-desc {
          font-size: 13px;
          color: var(--gray-500);
          margin-bottom: 10px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }
        .product-cta {
          width: 100%;
          justify-content: center;
          margin-top: 14px;
          font-size: 12px !important;
          padding: 10px 16px !important;
          background: var(--black);
          color: var(--white);
          border: 2px solid var(--black);
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: var(--transition);
          text-decoration: none;
        }
        .product-cta:hover {
          background: var(--white);
          color: var(--black);
        }
      `}</style>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="product-card">
      <div className="skeleton" style={{ aspectRatio: '1/1', width: '100%' }} />
      <div className="product-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        <div className="skeleton" style={{ height: '16px', width: '80%' }} />
        <div className="skeleton" style={{ height: '12px', width: '100%' }} />
        <div className="skeleton" style={{ height: '24px', width: '40%' }} />
      </div>
    </div>
  );
}

export default function ProductCatalog({ products, categories }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section id="catalogo" className="catalog-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-label">Nuestra Colección</span>
          <h2 className="section-title">Catálogo de Productos</h2>
          <p className="section-subtitle">
            Accesorios de calidad premium seleccionados especialmente para ti
          </p>
        </div>

        {/* Search */}
        <div className="catalog-search-row">
          <div className="catalog-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="category-tabs">
          <button
            className={`cat-tab${activeCategory === 'all' ? ' active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <div className="empty-icon">🛍️</div>
            <h3>No se encontraron productos</h3>
            <p>Próximamente nuevos productos en esta categoría</p>
            <a
              href="https://wa.me/584145851705"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ marginTop: '20px', display: 'inline-flex' }}
            >
              Consultar disponibilidad
            </a>
          </div>
        )}
      </div>

      <style jsx>{`
        .catalog-section {
          padding: 80px 0;
          background: var(--white);
        }
        .catalog-search-row {
          display: flex;
          justify-content: center;
          margin-bottom: 32px;
        }
        .catalog-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--gray-50);
          border: 1.5px solid var(--gray-200);
          border-radius: 40px;
          padding: 10px 20px;
          width: 100%;
          max-width: 420px;
          transition: var(--transition);
        }
        .catalog-search:focus-within {
          border-color: var(--black);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }
        .catalog-search svg {
          color: var(--gray-500);
          flex-shrink: 0;
        }
        .search-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: var(--gray-900);
          width: 100%;
        }
        .search-input::placeholder { color: var(--gray-400); }
        .category-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 8px;
          margin-bottom: 40px;
          scrollbar-width: none;
        }
        .category-tabs::-webkit-scrollbar { display: none; }
        .cat-tab {
          white-space: nowrap;
          padding: 8px 20px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.04em;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          background: var(--white);
          transition: var(--transition);
          cursor: pointer;
          flex-shrink: 0;
        }
        .cat-tab:hover { border-color: var(--black); color: var(--black); }
        .cat-tab.active {
          background: var(--black);
          color: var(--white);
          border-color: var(--black);
        }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
        .catalog-empty {
          text-align: center;
          padding: 80px 20px;
          color: var(--gray-500);
        }
        .empty-icon { font-size: 56px; margin-bottom: 20px; }
        .catalog-empty h3 { font-size: 20px; color: var(--gray-700); margin-bottom: 8px; }
        .catalog-empty p { font-size: 15px; }
        @media (max-width: 600px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
        }
      `}</style>
    </section>
  );
}
