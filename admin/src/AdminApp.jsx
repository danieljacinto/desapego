import { useState, useEffect, useRef } from 'react'
import styles from './AdminApp.module.css'


// Converte ./images/nome.jpg → /images/nome.jpg para o middleware local
function toLocalSrc(imgPath) {
  if (!imgPath) return null
  return imgPath.replace(/^\.\//,  '/')
}

const PRODUCTS_PATH = '/public-data/products.json'
const CONFIG_PATH = '/public-data/config.json'
const MAX_IMAGES = 3

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const emptyForm = {
  title: '', description: '', status: 'available',
  images: [], price: '', compareUrl: ''
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    title: product.title || '',
    description: product.description || '',
    status: product.status || 'available',
    images: product.images || [],
    price: product.price || '',
    compareUrl: product.compareUrl || '',
  })
  const [imagePreviews, setImagePreviews] = useState(
    (product.images || []).map(p => ({
      path: p,
      // tenta carregar do middleware /images/
      src: toLocalSrc(p)
    }))
  )
  const fileRef = useRef()

  const canAddMore = imagePreviews.length < MAX_IMAGES

  function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    const remaining = MAX_IMAGES - imagePreviews.length
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const imgPath = '/images/' + file.name
        setImagePreviews(prev => [...prev, { path: imgPath, src: ev.target.result }])
        setForm(f => ({ ...f, images: [...f.images, imgPath] }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeImage(idx) {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function handleSave(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    onSave({
      ...product,
      ...form,
      price: form.price ? parseFloat(form.price) : 0,
      slug: generateSlug(form.title),
    })
  }

  // Fechar com ESC
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Editar item</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className={styles.modalForm}>
          {/* Fotos */}
          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>Fotos</label>
              <span className={styles.imageCount}>{imagePreviews.length}/{MAX_IMAGES}</span>
            </div>
            <div className={styles.imageGrid}>
              {imagePreviews.map((img, idx) => (
                <div key={idx} className={styles.imageThumb}>
                  <img
                    src={img.src}
                    alt={`foto ${idx + 1}`}
                    onError={e => { e.target.style.opacity = '0.3' }}
                  />
                  {idx === 0 && <span className={styles.mainLabel}>principal</span>}
                  <button type="button" className={styles.removeThumb} onClick={() => removeImage(idx)}>
                    <svg viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              ))}
              {canAddMore && (
                <div className={styles.imageAdd} onClick={() => fileRef.current.click()}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>{imagePreviews.length === 0 ? 'Adicionar foto' : 'Mais foto'}</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
            <small className={styles.slug}>A primeira foto será a principal. Novas fotos: mova para public/images/ antes de exportar.</small>
          </div>

          {/* Título */}
          <div className={styles.field}>
            <label className={styles.label}>Título *</label>
            <input className={styles.input} type="text" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>

          {/* Descrição */}
          <div className={styles.field}>
            <label className={styles.label}>Descrição <span className={styles.optional}>(opcional)</span></label>
            <textarea className={styles.textarea} rows={4} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          {/* Preço */}
          <div className={styles.field}>
            <label className={styles.label}>Preço <span className={styles.optional}>(opcional)</span></label>
            <div className={styles.priceWrap}>
              <span className={styles.priceCurrency}>R$</span>
              <input className={`${styles.input} ${styles.priceInput}`} type="number" min="0" step="0.01"
                placeholder="0,00" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
          </div>

          {/* Link comparar */}
          <div className={styles.field}>
            <label className={styles.label}>Link para comparar <span className={styles.optional}>(opcional)</span></label>
            <input className={styles.input} type="url" placeholder="https://..." value={form.compareUrl}
              onChange={e => setForm(f => ({ ...f, compareUrl: e.target.value }))} />
          </div>

          {/* Status */}
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <div className={styles.statusToggle}>
              <button type="button"
                className={`${styles.statusBtn} ${form.status === 'available' ? styles.statusAvailable : ''}`}
                onClick={() => setForm(f => ({ ...f, status: 'available' }))}>
                <span className={styles.dot} /> Disponível
              </button>
              <button type="button"
                className={`${styles.statusBtn} ${form.status === 'sold' ? styles.statusSold : ''}`}
                onClick={() => setForm(f => ({ ...f, status: 'sold' }))}>
                <span className={styles.dot} /> Vendido
              </button>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
            <button type="submit" className={styles.btnPrimary}>Salvar alterações</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MAIN ADMIN ───────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [imagePreviews, setImagePreviews] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [tab, setTab] = useState('products')
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [loadSource, setLoadSource] = useState(null)
  const fileRef = useRef()
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  function handleDragStart(id) { dragItem.current = id }
  function handleDragEnter(id) { dragOverItem.current = id }
  function handleDragEnd() {
    const fromId = dragItem.current
    const toId = dragOverItem.current
    if (!fromId || !toId || fromId === toId) return
    setProducts(prev => {
      const updated = [...prev]
      const fromIndex = updated.findIndex(p => p.id === fromId)
      const toIndex = updated.findIndex(p => p.id === toId)
      const [dragged] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, dragged)
      return updated
    })
    dragItem.current = null
    dragOverItem.current = null
  }

  useEffect(() => {
    fetch(CONFIG_PATH)
      .then(r => r.json())
      .then(cfg => {
        setConfig(cfg)
        const remoteProxyUrl = cfg.publicUrl
          ? `/gh-pages${new URL(cfg.publicUrl).pathname.replace(/\/$/, '')}/products.json?t=${Date.now()}`
          : null

        const loadProducts = (data, source) => {
          const migrated = data.map(p => ({
            ...p,
            images: p.images || (p.image ? [p.image] : [])
          }))
          setProducts(migrated)
          setLoadSource(source)
        }

        if (remoteProxyUrl) {
          fetch(remoteProxyUrl)
            .then(r => { if (!r.ok) throw new Error(); return r.json() })
            .then(data => loadProducts(data, 'remote'))
            .catch(() => {
              fetch(PRODUCTS_PATH).then(r => r.json())
                .then(data => loadProducts(data, 'local'))
                .catch(() => setProducts([]))
            })
        } else {
          fetch(PRODUCTS_PATH).then(r => r.json())
            .then(data => loadProducts(data, 'local'))
            .catch(() => setProducts([]))
        }
      })
      .catch(() => {
        fetch(PRODUCTS_PATH).then(r => r.json())
          .then(data => setProducts(data.map(p => ({ ...p, images: p.images || (p.image ? [p.image] : []) }))))
          .catch(() => setProducts([]))
      })
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function handleImageUpload(e) {
    const files = Array.from(e.target.files)
    const remaining = MAX_IMAGES - imagePreviews.length
    files.slice(0, remaining).forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const imgPath = '/images/' + file.name
        setImagePreviews(prev => [...prev, { preview: ev.target.result, path: imgPath }])
        setForm(f => ({ ...f, images: [...f.images, imgPath] }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removeImage(idx) {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    const data = {
      ...form,
      price: form.price ? parseFloat(form.price) : 0,
      slug: generateSlug(form.title),
    }
    delete data.image
    setProducts(ps => [{
      id: generateId(),
      createdAt: new Date().toISOString().slice(0, 10),
      ...data,
    }, ...ps])
    showToast('Item adicionado com sucesso!')
    setForm(emptyForm)
    setImagePreviews([])
  }

  function handleSaveEdit(updated) {
    setProducts(ps => ps.map(p => p.id === updated.id ? updated : p))
    setEditingProduct(null)
    showToast('Item atualizado com sucesso!')
  }

  function handleDelete(id) {
    if (!confirm('Remover este item?')) return
    setProducts(ps => ps.filter(p => p.id !== id))
    showToast('Item removido.', 'info')
  }

  function toggleStatus(id) {
    setProducts(ps => ps.map(p =>
      p.id === id ? { ...p, status: p.status === 'available' ? 'sold' : 'available' } : p
    ))
  }

  function exportProducts() {
    // normaliza paths de volta para ./images/ antes de exportar
    const toExport = products.map(p => ({
      ...p,
      images: (p.images || []).map(img => img.startsWith('/images/') ? '.' + img : img)
    }))
    const blob = new Blob([JSON.stringify(toExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'products.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('products.json exportado! Mova para public/')
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'config.json'; a.click()
    URL.revokeObjectURL(url)
    showToast('config.json exportado!')
  }

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  const canAddMore = imagePreviews.length < MAX_IMAGES

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>desapego.</h1>
            <span className={styles.adminBadge}>admin</span>
          </div>
          <nav className={styles.tabs}>
            {['products', 'config', 'export'].map(t => (
              <button key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}>
                {t === 'products' ? 'itens' : t === 'config' ? 'configurações' : 'exportar'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {tab === 'products' && (
          <div className={styles.layout}>
            {/* ── FORM NOVO ITEM ── */}
            <aside className={styles.sidebar}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Novo item</h2>
                <form onSubmit={handleSubmit} className={styles.form}>

                  <div className={styles.field}>
                    <div className={styles.labelRow}>
                      <label className={styles.label}>Fotos</label>
                      <span className={styles.imageCount}>{imagePreviews.length}/{MAX_IMAGES}</span>
                    </div>
                    <div className={styles.imageGrid}>
                      {imagePreviews.map((img, idx) => (
                        <div key={idx} className={styles.imageThumb}>
                          <img src={img.preview} alt={`foto ${idx + 1}`} />
                          {idx === 0 && <span className={styles.mainLabel}>principal</span>}
                          <button type="button" className={styles.removeThumb} onClick={() => removeImage(idx)}>
                            <svg viewBox="0 0 16 16" fill="none">
                              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      {canAddMore && (
                        <div className={styles.imageAdd} onClick={() => fileRef.current.click()}>
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          <span>{imagePreviews.length === 0 ? 'Adicionar foto' : 'Mais foto'}</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" multiple
                      style={{ display: 'none' }} onChange={handleImageUpload} />
                    <small className={styles.slug}>Até {MAX_IMAGES} fotos. A primeira será a foto principal.</small>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Título *</label>
                    <input className={styles.input} type="text" placeholder="Ex: Câmera Sony A6400"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                    {form.title && <small className={styles.slug}>slug: {generateSlug(form.title)}</small>}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Descrição <span className={styles.optional}>(opcional)</span></label>
                    <textarea className={styles.textarea} placeholder="Detalhes sobre o item..." rows={4}
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Preço <span className={styles.optional}>(opcional)</span></label>
                    <div className={styles.priceWrap}>
                      <span className={styles.priceCurrency}>R$</span>
                      <input className={`${styles.input} ${styles.priceInput}`} type="number" min="0" step="0.01"
                        placeholder="0,00" value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Link para comparar <span className={styles.optional}>(opcional)</span></label>
                    <input className={styles.input} type="url" placeholder="https://www.amazon.com.br/..."
                      value={form.compareUrl} onChange={e => setForm(f => ({ ...f, compareUrl: e.target.value }))} />
                    <small className={styles.slug}>Link onde a pessoa pode ver o preço do produto novo.</small>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <div className={styles.statusToggle}>
                      <button type="button"
                        className={`${styles.statusBtn} ${form.status === 'available' ? styles.statusAvailable : ''}`}
                        onClick={() => setForm(f => ({ ...f, status: 'available' }))}>
                        <span className={styles.dot} /> Disponível
                      </button>
                      <button type="button"
                        className={`${styles.statusBtn} ${form.status === 'sold' ? styles.statusSold : ''}`}
                        onClick={() => setForm(f => ({ ...f, status: 'sold' }))}>
                        <span className={styles.dot} /> Vendido
                      </button>
                    </div>
                  </div>

                  <button type="submit" className={styles.btnPrimary}>Adicionar item</button>
                </form>
              </div>
            </aside>

            {/* ── LISTA DE PRODUTOS ── */}
            <div className={styles.content}>
              <div className={styles.listHeader}>
                <h2 className={styles.cardTitle}>
                  {products.length} {products.length === 1 ? 'item' : 'itens'}
                </h2>
                <div className={styles.listSearch}>
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input type="search" placeholder="buscar..." value={search}
                    onChange={e => setSearch(e.target.value)} className={styles.listSearchInput} />
                </div>
              </div>

              {loadSource && (
                <div className={`${styles.sourceTag} ${loadSource === 'remote' ? styles.sourceRemote : styles.sourceLocal}`}>
                  {loadSource === 'remote' ? (
                    <>
                      <svg viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M5.5 8c0-1.5.5-3 2.5-3s2.5 1.5 2.5 3-.5 3-2.5 3-2.5-1.5-2.5-3z" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M2 8h12" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      Sincronizado com o site publicado
                      <a href={config.publicUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>ver site →</a>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 16 16" fill="none">
                        <path d="M2 12V5l6-3 6 3v7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                        <rect x="5" y="8" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      Carregado do arquivo local
                    </>
                  )}
                </div>
              )}

              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Nenhum item ainda. Adicione o primeiro!</p>
                </div>
              ) : (
                <>
                  {!search && (
                    <p className={styles.dragHint}>
                      <svg viewBox="0 0 16 16" fill="none">
                        <path d="M6 3v10M10 3v10M3 6h10M3 10h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      Arraste os itens para reordenar
                    </p>
                  )}
                  <div className={styles.productList}>
                    {filtered.map(product => {
                      const thumb = product.images?.[0] || product.image || null
                      const thumbSrc = toLocalSrc(thumb)
                      return (
                        <div key={product.id}
                          className={`${styles.productRow} ${product.status === 'sold' ? styles.productSold : ''}`}
                          draggable={!search}
                          onDragStart={() => handleDragStart(product.id)}
                          onDragEnter={() => handleDragEnter(product.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => e.preventDefault()}>

                          {!search && (
                            <div className={styles.dragHandle}>
                              <svg viewBox="0 0 16 16" fill="none">
                                <circle cx="5.5" cy="4" r="1" fill="currentColor"/>
                                <circle cx="10.5" cy="4" r="1" fill="currentColor"/>
                                <circle cx="5.5" cy="8" r="1" fill="currentColor"/>
                                <circle cx="10.5" cy="8" r="1" fill="currentColor"/>
                                <circle cx="5.5" cy="12" r="1" fill="currentColor"/>
                                <circle cx="10.5" cy="12" r="1" fill="currentColor"/>
                              </svg>
                            </div>
                          )}

                          <div className={styles.productImg}>
                            {thumbSrc ? (
                              <img src={thumbSrc} alt={product.title}
                                onError={e => { e.target.style.display = 'none' }} />
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" style={{width:20,height:20}}>
                                <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                                <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            )}
                          </div>

                          <div className={styles.productInfo}>
                            <span className={styles.productTitle}>{product.title}</span>
                            {product.description && (
                              <span className={styles.productDesc}>{product.description}</span>
                            )}
                            <div style={{display:'flex',gap:'6px',alignItems:'center',flexWrap:'wrap'}}>
                              <span className={`${styles.productBadge} ${product.status === 'available' ? styles.badgeAvailable : styles.badgeSold}`}>
                                {product.status === 'available' ? 'Disponível' : 'Vendido'}
                              </span>
                              {product.images?.length > 1 && (
                                <span className={styles.photoCount}>{product.images.length} fotos</span>
                              )}
                            </div>
                          </div>

                          <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                            <button
                              style={{width:34,height:34,borderRadius:8,border:'1px solid #e8e6e1',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#9e9893'}}
                              onClick={() => toggleStatus(product.id)}
                              title={product.status === 'available' ? 'Marcar como vendido' : 'Marcar como disponível'}>
                              {product.status === 'available' ? (
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 4v6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/></svg>
                              )}
                            </button>
                            <button
                              style={{width:34,height:34,borderRadius:8,border:'1px solid #e8e6e1',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#9e9893'}}
                              onClick={() => setEditingProduct(product)}
                              title="Editar">
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M14 3l3 3-9.5 9.5-4 1 1-4L14 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                            </button>
                            <button
                              style={{width:34,height:34,borderRadius:8,border:'1px solid #e8e6e1',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#9e9893'}}
                              onClick={() => handleDelete(product.id)}
                              title="Remover">
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              <div className={styles.exportTip}>
                <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Após editar, vá em <strong>Exportar</strong> para salvar o arquivo e fazer push no GitHub.
              </div>
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className={styles.configLayout}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Configurações do site</h2>
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Nome do site</label>
                  <input className={styles.input} value={config.siteName || ''}
                    onChange={e => setConfig(c => ({ ...c, siteName: e.target.value }))} placeholder="desapego." />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Descrição / tagline</label>
                  <input className={styles.input} value={config.siteDescription || ''}
                    onChange={e => setConfig(c => ({ ...c, siteDescription: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Número do WhatsApp</label>
                  <input className={styles.input} value={config.whatsappNumber || ''}
                    onChange={e => setConfig(c => ({ ...c, whatsappNumber: e.target.value }))} placeholder="5511999999999" />
                  <small className={styles.slug}>DDI + DDD + número, só dígitos.</small>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mensagem do WhatsApp</label>
                  <textarea className={styles.textarea} rows={3} value={config.whatsappMessage || ''}
                    onChange={e => setConfig(c => ({ ...c, whatsappMessage: e.target.value }))}
                    placeholder="Olá, tenho interesse no item: {TITLE}. Ainda está disponível?" />
                  <small className={styles.slug}>Use {'{TITLE}'} para inserir o nome do item automaticamente.</small>
                </div>
                <button className={styles.btnPrimary} onClick={exportConfig}>Salvar e exportar config.json</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'export' && (
          <div className={styles.configLayout}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Exportar e publicar</h2>
              <p className={styles.exportDesc}>O site é 100% estático. Para atualizar, exporte os arquivos e faça push no GitHub.</p>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepNum}>1</span>
                  <div>
                    <strong>Exporte o products.json</strong>
                    <p>Clique no botão abaixo e mova o arquivo para a pasta <code>public/</code>.</p>
                    <button className={styles.btnPrimary} onClick={exportProducts} style={{ marginTop: '12px' }}>↓ Baixar products.json</button>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNum}>2</span>
                  <div>
                    <strong>Copie as imagens</strong>
                    <p>Mova as fotos para <code>public/images/</code>.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNum}>3</span>
                  <div>
                    <strong>Build e push</strong>
                    <pre className={styles.code}>{`git add .\ngit commit -m "atualiza produtos"\ngit push`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE EDIÇÃO */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditingProduct(null)}
        />
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
