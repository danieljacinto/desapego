import styles from './Footer.module.css'

export default function Footer({ config }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.logo}>{config.siteName || 'desapego.'}</span>
        <p className={styles.text}>
          feito com cuidado · todos os itens são usados
        </p>
      </div>
    </footer>
  )
}
