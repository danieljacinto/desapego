import styles from './Header.module.css'

export default function Header({ config }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          {config.siteName || 'desapego.'}
        </a>
        <nav className={styles.nav}>
          <a
            href="https://wa.me/"
            className={styles.navLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            contato
          </a>
        </nav>
      </div>
    </header>
  )
}
