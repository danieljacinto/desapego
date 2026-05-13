import styles from './Header.module.css'

export default function Header({ config }) {
  const number = (config.whatsappNumber || '').replace(/\D/g, '')
  const contactUrl = number ? `https://wa.me/${number}` : null

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a href="/" className={styles.logo}>
          {config.siteName || 'desapego.'}
        </a>
        <nav className={styles.nav}>
          {contactUrl && (
            <a
              href={contactUrl}
              className={styles.navLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              contato
            </a>
          )}
        </nav>
      </div>
    </header>
  )
}
