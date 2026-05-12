import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, config, loading }) {
  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.grid}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
              <path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Nenhum item encontrado</p>
          <p className={styles.emptyText}>Tente ajustar sua busca ou filtro.</p>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            config={config}
            index={index}
          />
        ))}
      </div>
    </section>
  )
}
