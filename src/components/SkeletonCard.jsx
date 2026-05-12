import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.content}>
        <div className={styles.badge} />
        <div className={styles.title} />
        <div className={styles.titleShort} />
        <div className={styles.desc} />
        <div className={styles.descShort} />
        <div className={styles.btn} />
      </div>
    </div>
  )
}
