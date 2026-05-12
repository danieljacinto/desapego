import styles from './Hero.module.css'

export default function Hero({ config }) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>curadoria pessoal</p>
        <h1 className={styles.title}>
          {config.siteDescription || 'Itens com história,\nprontos para um novo lar.'}
        </h1>
        <div className={styles.divider} />
      </div>
    </section>
  )
}
