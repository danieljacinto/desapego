import { useState, useEffect, useRef } from 'react'
import styles from './AdminApp.module.css'

const PRODUCTS_PATH = '../public/products.json'
const CONFIG_PATH = '../public/config.json'

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

const emptyForm = { title: '', description: '', status: 'available', image: '', price: '', compareUrl: '' }

export default function AdminApp() {
  const [products, setProducts] = useState([])
  const [config, setConfig] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [tab, setTab] = useState('products') // products | config | export
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const fileRef = useRef()

  // Load data
  useEffect(() => {
    fetch(PRODUCTS_PATH).then(r => r.json()).then(setProducts).catch(() => setProducts([]))
    fetch(CONFIG_PATH).then(r => r.json()).then(setConfig).catch(() => {})
  }, [])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Image upload → base64 preview
  function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setPreview(ev.target.result)
      setForm(f => ({ ...f, image: `/images/${file.name}` }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return

    if (editingId) {
      setProducts(ps => ps.map(p => p.id === editingId
        ? { ...p, ...form, slug: generateSlug(form.title) }
        : p
      ))
      showToast('Item atualizado com sucesso!')
      setEditingId(null)
    } else {
      const newProduct = {
        id: generateId(),
        slug: generateSlug(form.title),
        ...form,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setProducts(ps => [newProduct, ...ps])
      showToast('Item adicionado com sucesso!')
    }
    setForm(emptyForm)
    setPreview(null)
  }

  function handleEdit(product) {
    setForm({
      title: product.title,
      description: product.description || '',
      status: product.status,
      image: product.image || '',
      price: product.price || '',
      compareUrl: product.compareUrl || '',
    })
    setPreview(null)
    setEditingId(product.id)
    setTab('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setPreview(null)
  }

  // Export products.json
  function exportProducts() {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('products.json exportado! Mova para public/')
  }

  function exportConfig() {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'config.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('config.json exportado!')
  }

  const filtered = products.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>desapego.</h1>
            <span className={styles.adminBadge}>admin</span>
          </div>
          <nav className={styles.tabs}>
            {['products', 'config', 'export'].map(t => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'products' ? 'itens' : t === 'config' ? 'configurações' : 'exportar'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {/* PRODUCTS TAB */}
        {tab === 'products' && (
          <div className={styles.layout}>
            {/* Form */}
            <aside className={styles.sidebar}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  {editingId ? 'Editar item' : 'Novo item'}
                </h2>

                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Image upload */}
                  <div className={styles.field}>
                    <label className={styles.label}>Foto</label>
                    <div
                      className={styles.imageUpload}
                      onClick={() => fileRef.current.click()}
                      style={preview ? { padding: 0, border: 'none' } : {}}
                    >
                      {preview ? (
                        <img src={preview} alt="preview" className={styles.imagePreview} />
                      ) : form.image && !preview ? (
                        <div className={styles.imagePath}>
                          <svg viewBox="0 0 20 20" fill="none"><path d="M4 14l4-4 3 3 2-2 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                          <span>{form.image.split('/').pop()}</span>
                        </div>
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                            <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Clique para selecionar imagem</span>
                          <small>PNG, JPG, WEBP</small>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    {preview && (
                      <button type="button" className={styles.removeImg} onClick={() => { setPreview(null); setForm(f => ({ ...f, image: '' })); }}>
                        Remover foto
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <div className={styles.field}>
                    <label className={styles.label}>Título *</label>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Ex: Câmera Sony A6400"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                    {form.title && (
                      <small className={styles.slug}>slug: {generateSlug(form.title)}</small>
                    )}
                  </div>

                  {/* Description */}
                  <div className={styles.field}>
                    <label className={styles.label}>Descrição <span className={styles.optional}>(opcional)</span></label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Detalhes sobre o item, estado de conservação..."
                      rows={4}
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* Price */}
                  <div className={styles.field}>
                    <label className={styles.label}>Preço <span className={styles.optional}>(opcional)</span></label>
                    <div className={styles.priceWrap}>
                      <span className={styles.priceCurrency}>R$</span>
                      <input
                        className={`${styles.input} ${styles.priceInput}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Compare URL */}
                  <div className={styles.field}>
                    <label className={styles.label}>Link para comparar <span className={styles.optional}>(opcional)</span></label>
                    <input
                      className={styles.input}
                      type="url"
                      placeholder="https://www.amazon.com.br/..."
                      value={form.compareUrl}
                      onChange={e => setForm(f => ({ ...f, compareUrl: e.target.value }))}
                    />
                    <small className={styles.slug}>Link onde a pessoa pode ver o preço do produto novo.</small>
                  </div>

                  {/* Status */}
                  <div className={styles.field}>
                    <label className={styles.label}>Status</label>
                    <div className={styles.statusToggle}>
                      <button
                        type="button"
                        className={`${styles.statusBtn} ${form.status === 'available' ? styles.statusAvailable : ''}`}
                        onClick={() => setForm(f => ({ ...f, status: 'available' }))}
                      >
                        <span className={styles.dot} /> Disponível
                      </button>
                      <button
                        type="button"
                        className={`${styles.statusBtn} ${form.status === 'sold' ? styles.statusSold : ''}`}
                        onClick={() => setForm(f => ({ ...f, status: 'sold' }))}
                      >
                        <span className={styles.dot} /> Vendido
                      </button>
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    {editingId && (
                      <button type="button" className={styles.btnSecondary} onClick={cancelEdit}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" className={styles.btnPrimary}>
                      {editingId ? 'Salvar alterações' : 'Adicionar item'}
                    </button>
                  </div>
                </form>
              </div>
            </aside>

            {/* Product list */}
            <div className={styles.content}>
              <div className={styles.listHeader}>
                <h2 className={styles.cardTitle}>
                  {products.length} {products.length === 1 ? 'item' : 'itens'}
                </h2>
                <div className={styles.listSearch}>
                  <svg viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <input
                    type="search"
                    placeholder="buscar..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={styles.listSearchInput}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>Nenhum item ainda. Adicione o primeiro item!</p>
                </div>
              ) : (
                <div className={styles.productList}>
                  {filtered.map(product => (
                    <div key={product.id} className={`${styles.productRow} ${product.status === 'sold' ? styles.productSold : ''}`}>
                      <div className={styles.productImg}>
                        <img
                          src={product.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"%3E%3Crect fill="%23f0ede8" width="60" height="60"/%3E%3C/svg%3E'}
                          alt={product.title}
                          onError={e => { e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"%3E%3Crect fill="%23f0ede8" width="60" height="60"/%3E%3C/svg%3E' }}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <span className={styles.productTitle}>{product.title}</span>
                        {product.description && (
                          <span className={styles.productDesc}>{product.description}</span>
                        )}
                        <span className={`${styles.productBadge} ${product.status === 'available' ? styles.badgeAvailable : styles.badgeSold}`}>
                          {product.status === 'available' ? 'Disponível' : 'Vendido'}
                        </span>
                      </div>
                      <div className={styles.productActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() => toggleStatus(product.id)}
                          title={product.status === 'available' ? 'Marcar como vendido' : 'Marcar como disponível'}
                        >
                          {product.status === 'available' ? (
                            <svg viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="none"><path d="M10 4v6l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/></svg>
                          )}
                        </button>
                        <button className={styles.actionBtn} onClick={() => handleEdit(product)} title="Editar">
                          <svg viewBox="0 0 20 20" fill="none"><path d="M14 3l3 3-9.5 9.5-4 1 1-4L14 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(product.id)} title="Remover">
                          <svg viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.exportTip}>
                <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                Após editar, vá em <strong>Exportar</strong> para salvar o arquivo e fazer push no GitHub.
              </div>
            </div>
          </div>
        )}

        {/* CONFIG TAB */}
        {tab === 'config' && (
          <div className={styles.configLayout}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Configurações do site</h2>
              <div className={styles.form}>
                <div className={styles.field}>
                  <label className={styles.label}>Nome do site</label>
                  <input className={styles.input} value={config.siteName || ''} onChange={e => setConfig(c => ({ ...c, siteName: e.target.value }))} placeholder="desapego." />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Descrição / tagline</label>
                  <input className={styles.input} value={config.siteDescription || ''} onChange={e => setConfig(c => ({ ...c, siteDescription: e.target.value }))} placeholder="Itens com história, prontos para um novo lar." />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Número do WhatsApp</label>
                  <input className={styles.input} value={config.whatsappNumber || ''} onChange={e => setConfig(c => ({ ...c, whatsappNumber: e.target.value }))} placeholder="5511999999999 (só números, com DDI)" />
                  <small className={styles.slug}>Formato: DDI + DDD + número. Ex: 5511987654321</small>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mensagem do WhatsApp</label>
                  <textarea className={styles.textarea} rows={3} value={config.whatsappMessage || ''} onChange={e => setConfig(c => ({ ...c, whatsappMessage: e.target.value }))} placeholder="Olá, tenho interesse no item: {TITLE}. Ainda está disponível?" />
                  <small className={styles.slug}>Use {'{TITLE}'} para inserir o nome do item automaticamente.</small>
                </div>
                <button className={styles.btnPrimary} onClick={exportConfig}>
                  Salvar e exportar config.json
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXPORT TAB */}
        {tab === 'export' && (
          <div className={styles.configLayout}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Exportar e publicar</h2>
              <p className={styles.exportDesc}>
                O site é 100% estático. Para atualizar, exporte os arquivos e faça push no GitHub.
              </p>

              <div className={styles.steps}>
                <div className={styles.step}>
                  <span className={styles.stepNum}>1</span>
                  <div>
                    <strong>Exporte o products.json</strong>
                    <p>Clique no botão abaixo e mova o arquivo baixado para a pasta <code>public/</code> do projeto.</p>
                    <button className={styles.btnPrimary} onClick={exportProducts} style={{ marginTop: '12px' }}>
                      ↓ Baixar products.json
                    </button>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNum}>2</span>
                  <div>
                    <strong>Copie as imagens</strong>
                    <p>Mova as fotos dos itens para <code>public/images/</code>. Os nomes devem bater com os cadastrados.</p>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNum}>3</span>
                  <div>
                    <strong>Build e push</strong>
                    <p>No terminal, rode:</p>
                    <pre className={styles.code}>{`npm run build\ngit add .\ngit commit -m "atualiza produtos"\ngit push`}</pre>
                  </div>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNum}>4</span>
                  <div>
                    <strong>GitHub Actions faz o deploy</strong>
                    <p>O arquivo <code>.github/workflows/deploy.yml</code> cuida do deploy automático no GitHub Pages.</p>
                  </div>
                </div>
              </div>

              <div className={styles.exportTip} style={{ marginTop: '24px' }}>
                <svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9v5M10 6.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                O painel admin <strong>não é hospedado</strong> — roda só localmente com <code>npm run admin</code>.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'info' ? styles.toastInfo : ''}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
