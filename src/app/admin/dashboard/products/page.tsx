'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getSiteContent,
} from '@/lib/firebaseUtils';
import { useUploadThing } from '@/lib/uploadthing';
import { Product } from '@/lib/types';
import { deleteImagesByUrl } from '@/app/actions/uploadthing';

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`toast toast-${type}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: 'transparent', color: 'inherit', fontSize: '18px', lineHeight: 1 }}>×</button>
    </div>
  );
}

function ProductEditModal({
  product,
  categories,
  onSave,
  onClose,
}: {
  product: Product;
  categories: string[];
  onSave: (id: string, data: Partial<Product>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    description: product.description || '',
    category: product.category || categories[0] || 'Otros',
    discount: product.discount || 0,
    inStock: product.inStock !== false,
    status: product.status || 'draft',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(product.id, { ...form });
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Editar Producto</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {product.images.length > 0 && (
            <div className="modal-images">
              {product.images.slice(0, 4).map((img, i) => (
                <img key={i} src={img} alt="" className="modal-thumb" />
              ))}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nombre del Producto</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Reloj Cronógrafo Negro"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio (USD)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio Original (opcional)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                step="0.01"
                value={form.originalPrice}
                onChange={(e) => handleChange('originalPrice', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descuento (%)</label>
              <input
                className="form-input"
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => handleChange('discount', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe el producto, materiales, tallas disponibles..."
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
              <input
                type="checkbox"
                id="inStock"
                checked={form.inStock}
                onChange={(e) => handleChange('inStock', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="inStock" className="form-label" style={{ margin: 0, cursor: 'pointer', textTransform: 'none', fontSize: '14px' }}>
                En stock
              </label>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9000;
          padding: 20px;
        }
        .modal-card {
          background: var(--white);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-xl);
        }
        .modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--gray-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .modal-header h3 { font-size: 18px; font-weight: 700; color: var(--gray-900); }
        .modal-close {
          font-size: 24px;
          color: var(--gray-500);
          line-height: 1;
          transition: color 0.2s;
        }
        .modal-close:hover { color: var(--black); }
        .modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }
        .modal-images {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .modal-thumb {
          width: 72px;
          height: 72px;
          object-fit: cover;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--gray-200);
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--gray-200);
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
          .modal-footer { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload } = useUploadThing("imageUploader");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: 'success' | 'error' }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const addToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadProducts = useCallback(async () => {
    const [prods, content] = await Promise.all([
      getAllProductsAdmin(),
      getSiteContent()
    ]);
    setProducts(prods);
    setCategories(content.categories || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleFilesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileArr = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (fileArr.length === 0) {
        addToast('Solo se aceptan archivos de imagen.', 'error');
        setUploading(false);
        return;
      }

      // Upload all images at once and create a product per image
      let created = 0;
      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        const uploadRes = await startUpload([file]);
        const urls = uploadRes ? uploadRes.map((res) => res.ufsUrl) : [];
        if (urls.length === 0) continue;

        await createProduct({
          name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          price: 0,
          description: '',
          category: categories[0] || 'Otros',
          images: urls,
          inStock: true,
          featured: false,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        created++;
        setUploadProgress(Math.round((i + 1) / fileArr.length * 100));
      }

      addToast(`✅ ${created} producto(s) subido(s). Ahora edita sus datos.`);
      await loadProducts();
    } catch (err) {
      addToast('Error al subir imágenes. Verifica la configuración de Firebase.', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveProduct = async (id: string, data: Partial<Product>) => {
    try {
      await updateProduct(id, data);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );
      addToast('Producto actualizado correctamente.');
    } catch {
      addToast('Error al actualizar el producto.', 'error');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      if (product.images?.length > 0) {
        // Borramos las imágenes remota primero
        await deleteImagesByUrl(product.images);
      }
      
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      addToast('Producto e imágenes eliminados.');
      setDeleteConfirm(null);
    } catch {
      addToast('Error al eliminar.', 'error');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'published' ? 'draft' : 'published';
    await handleSaveProduct(product.id, { status: newStatus });
  };

  const filteredProducts = products.filter((p) => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="products-page">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer. Las imágenes también serán eliminadas de UploadThing y dejarán de ocupar espacio.</p>
            <div className="delete-dialog-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDeleteProduct(deleteConfirm)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <h1 className="page-title">Gestión de Productos</h1>

      {/* Upload Zone */}
      <div
        className={`upload-zone${dragOver ? ' drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFilesUpload(e.dataTransfer.files); }}
      >
        {uploading ? (
          <div className="upload-progress">
            <div className="upload-spinner" />
            <p>Subiendo imágenes a Firebase... {uploadProgress}%</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="upload-icon">🖼️</div>
            <p className="upload-title">Arrastra y suelta imágenes aquí</p>
            <p className="upload-subtitle">o</p>
            <label className="btn-primary upload-btn">
              Seleccionar imágenes
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFilesUpload(e.target.files)}
              />
            </label>
            <p className="upload-hint">Sube múltiples imágenes a la vez. Cada imagen creará un producto que luego podrás editar.</p>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="products-toolbar">
        <div className="products-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="products-search"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              className={`filter-tab${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Borradores'}
              <span className="filter-count">
                {f === 'all' ? products.length : products.filter((p) => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Table / Grid */}
      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 8 }} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📦</div>
          <h3>No hay productos aquí</h3>
          <p>Sube imágenes arriba para empezar a crear tu catálogo.</p>
        </div>
      ) : (
        <div className="products-list">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-row">
              <div className="product-row-img">
                {product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <div className="product-row-no-img">📷</div>
                )}
              </div>
              <div className="product-row-info">
                <div className="product-row-name">
                  {product.name || <span style={{ color: 'var(--gray-400)', fontStyle: 'italic' }}>Sin nombre</span>}
                </div>
                <div className="product-row-meta">
                  {product.category} · {product.images.length} imagen(es)
                </div>
              </div>
              <div className="product-row-price">
                {product.price > 0 ? `$${product.price.toLocaleString()}` : <span style={{ color: 'var(--gray-400)' }}>Sin precio</span>}
              </div>
              <div className="product-row-status">
                <button
                  className={`status-badge${product.status === 'published' ? ' published' : ' draft'}`}
                  onClick={() => handleToggleStatus(product)}
                  title="Clic para cambiar estado"
                >
                  {product.status === 'published' ? '✅ Publicado' : '📝 Borrador'}
                </button>
              </div>
              <div className="product-row-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => setEditingProduct(product)}
                  title="Editar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => setDeleteConfirm(product)}
                  title="Eliminar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .products-page { display: flex; flex-direction: column; gap: 24px; }
        .page-title { font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--gray-900); }
        .upload-zone {
          border: 2px dashed var(--gray-300);
          border-radius: var(--radius-xl);
          padding: 48px 24px;
          text-align: center;
          background: var(--gray-50);
          transition: var(--transition);
          cursor: pointer;
        }
        .upload-zone.drag-over {
          border-color: var(--black);
          background: rgba(0,0,0,0.02);
          transform: scale(1.01);
        }
        .upload-icon { font-size: 48px; margin-bottom: 16px; }
        .upload-title { font-size: 18px; font-weight: 600; color: var(--gray-900); margin-bottom: 8px; }
        .upload-subtitle { font-size: 14px; color: var(--gray-500); margin-bottom: 16px; }
        .upload-btn { cursor: pointer; display: inline-flex; }
        .upload-hint { font-size: 12px; color: var(--gray-400); margin-top: 16px; max-width: 400px; margin-left: auto; margin-right: auto; }
        .upload-progress { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .upload-spinner {
          width: 40px; height: 40px;
          border: 3px solid var(--gray-200);
          border-top-color: var(--black);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        .progress-bar { width: 200px; height: 4px; background: var(--gray-200); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--black); transition: width 0.3s ease; }
        .products-toolbar {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .products-search-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--white);
          border: 1.5px solid var(--gray-200);
          border-radius: var(--radius-full);
          padding: 8px 16px;
          flex: 1;
          min-width: 200px;
          max-width: 320px;
        }
        .products-search-wrap:focus-within { border-color: var(--black); }
        .products-search { border: none; outline: none; font-size: 14px; background: transparent; width: 100%; }
        .filter-tabs { display: flex; gap: 6px; }
        .filter-tab {
          padding: 7px 14px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          background: var(--white);
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition);
        }
        .filter-tab:hover { border-color: var(--black); color: var(--black); }
        .filter-tab.active { background: var(--black); color: var(--white); border-color: var(--black); }
        .filter-count {
          background: rgba(255,255,255,0.2);
          padding: 1px 7px;
          border-radius: 10px;
          font-size: 11px;
        }
        .filter-tab:not(.active) .filter-count { background: var(--gray-100); color: var(--gray-600); }
        .products-list { display: flex; flex-direction: column; gap: 8px; }
        .product-row {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: var(--transition);
        }
        .product-row:hover { border-color: var(--gray-400); box-shadow: var(--shadow-sm); }
        .product-row-img {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--gray-100);
        }
        .product-row-img img { width: 100%; height: 100%; object-fit: cover; }
        .product-row-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .product-row-info { flex: 1; min-width: 0; }
        .product-row-name { font-size: 14px; font-weight: 600; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .product-row-meta { font-size: 12px; color: var(--gray-500); margin-top: 3px; }
        .product-row-price { font-size: 15px; font-weight: 700; color: var(--gray-900); min-width: 80px; text-align: right; }
        .status-badge {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          border: none;
          white-space: nowrap;
        }
        .status-badge.published { background: #d1fae5; color: #065f46; }
        .status-badge.draft { background: var(--gray-100); color: var(--gray-600); }
        .status-badge:hover { opacity: 0.8; }
        .product-row-actions { display: flex; gap: 6px; }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 12px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 500;
          border: 1.5px solid;
          cursor: pointer;
          transition: var(--transition);
        }
        .edit-btn { border-color: var(--gray-300); color: var(--gray-700); background: var(--white); }
        .edit-btn:hover { border-color: var(--black); color: var(--black); }
        .delete-btn { border-color: #fca5a5; color: #dc2626; background: #fef2f2; }
        .delete-btn:hover { color: #b91c1c; background: #fee2e2; border-color: #ef4444; }
        .empty-state { text-align: center; padding: 60px; color: var(--gray-500); }
        .empty-state h3 { font-size: 18px; color: var(--gray-700); margin: 16px 0 8px; }
        .loading-grid { display: flex; flex-direction: column; gap: 8px; }
        :global(.delete-dialog) {
          background: var(--white);
          border-radius: var(--radius-xl);
          padding: 32px;
          max-width: 360px;
          box-shadow: var(--shadow-xl);
        }
        :global(.delete-dialog h3) { font-size: 18px; font-weight: 700; color: var(--gray-900); margin-bottom: 12px; }
        :global(.delete-dialog p) { font-size: 14px; color: var(--gray-500); margin-bottom: 24px; line-height: 1.6; }
        :global(.delete-dialog-actions) { display: flex; gap: 12px; justify-content: flex-end; }
        :global(.modal-overlay) {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9000;
          padding: 20px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .product-row-price { display: none; }
          .filter-tabs { display: none; }
          .products-search-wrap { max-width: 100%; }
          .action-btn span { display: none; }
          .action-btn { padding: 7px; }
        }
      `}</style>
    </div>
  );
}
