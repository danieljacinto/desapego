import styles from './FilterBar.module.css'

export default function FilterBar({ search, onSearch, filter, onFilter, counts }) {
  const filters = [
    { key: 'all', label: 'todos', count: counts.all },
    { key: 'available', label: 'disponíveis', count: counts.available },
    { key: 'sold', label: 'vendidos', count: counts.sold },
  ]

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.search}
            type="search"
            placeholder="buscar itens..."
            value={search}
            onChange={e => onSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => onSearch('')} aria-label="Limpar busca">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className={styles.filters}>
          {filters.map(f => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
              onClick={() => onFilter(f.key)}
            >
              {f.label}
              <span className={styles.count}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
