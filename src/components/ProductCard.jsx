import { createPortal } from 'react-dom'
import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './ProductCard.module.css'

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0ede8" width="400" height="300"/%3E%3Ctext fill="%23c4bfb9" font-family="system-ui" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3Esem imagem%3C/text%3E%3C/svg%3E'

function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const total = images.length

  const prev = useCallback((e) => {
    e?.stopPropagation()
    setCurrent(c => (c - 1 + total) % total)
  }, [total])

  const next = useCallback((e) => {
    e?.stopPropagation()
    setCurrent(c => (c + 1) % total)
  }, [total])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  return (
    <div className={styles.lightboxOverlay} onClick={onClose}>
      <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>

        {/* Close */}
        <button className={styles.lightboxClose} onClick={onClose} aria-label="Fechar">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Image */}
        <div className={styles.lightboxImgWrap}>
          <img
            src={images[current]}
            alt={`Foto ${current + 1}`}
            className={styles.lightboxImg}
          />
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`} onClick={prev} aria-label="Anterior">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`} onClick={next} aria-label="Próxima">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {/* Counter */}
        {total > 1 && (
          <div className={styles.lightboxCounter}>
            {current + 1} / {total}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductCard({ product, config, index }) {
  const isAvailable = product.status === 'available'

  const images = product.images?.length
    ? product.images
    : product.image
    ? [product.image]
    : []

  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState({})
  const [errors, setErrors] = useState({})
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const touchStartX = useRef(null)
  const touchStartY = useRef(null)

  const total = images.length

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    // Só processa se o movimento horizontal for maior que o vertical (evita conflito com scroll)
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) setCurrent(c => (c + 1) % total)
    else setCurrent(c => (c - 1 + total) % total)
    touchStartX.current = null
    touchStartY.current = null
  }

  function prev(e) {
    e.stopPropagation()
    setCurrent(c => (c - 1 + total) % total)
  }
  function next(e) {
    e.stopPropagation()
    setCurrent(c => (c + 1) % total)
  }

  function openLightbox(e) {
    e.stopPropagation()
    if (images.length === 0 || errors[current]) return
    setLightboxIndex(current)
  }

  const handleWhatsApp = () => {
    const number = (config.whatsappNumber || '').replace(/\D/g, '')
    const template = config.whatsappMessage || 'Olá, tenho interesse no item: {TITLE}. Ainda está disponível?'
    const message = template.replace('{TITLE}', product.title)
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
  }

  const validImages = images.filter((_, i) => !errors[i])

  return (
    <>
      <article className={styles.card} style={{ animationDelay: `${index * 0.06}s` }}>

        {/* IMAGE CAROUSEL */}
        <div
          className={`${styles.imageWrap} ${!isAvailable ? styles.sold : ''}`}
          onTouchStart={total > 1 ? handleTouchStart : undefined}
          onTouchEnd={total > 1 ? handleTouchEnd : undefined}
        >

          {images.length > 0 ? images.map((src, i) => (
            <div key={i} className={`${styles.slide} ${i === current ? styles.slideActive : ''}`}>
              {!loaded[i] && !errors[i] && <div className={styles.skeleton} />}
              <img
                src={errors[i] ? FALLBACK : src}
                alt={`${product.title} — foto ${i + 1}`}
                className={`${styles.image} ${loaded[i] ? styles.visible : ''} ${!errors[i] ? styles.clickable : ''}`}
                loading="eager"
                onClick={!errors[i] ? openLightbox : undefined}
                onLoad={() => setLoaded(l => ({ ...l, [i]: true }))}
                onError={() => { setErrors(e => ({ ...e, [i]: true })); setLoaded(l => ({ ...l, [i]: true })) }}
              />
              {/* Zoom hint */}
              {!errors[i] && loaded[i] && (
                <button className={styles.zoomBtn} onClick={openLightbox} aria-label="Ampliar foto">
                  <svg viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12.5 12.5l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6.5 8.5h4M8.5 6.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>
          )) : (
            <div className={`${styles.slide} ${styles.slideActive}`}>
              <img src={FALLBACK} alt="sem imagem" className={`${styles.image} ${styles.visible}`} />
            </div>
          )}

          {total > 1 && (
            <>
              <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Foto anterior">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M12 5l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Próxima foto">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M8 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className={styles.dots}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                    onClick={e => { e.stopPropagation(); setCurrent(i) }}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}

          {!isAvailable && (
            <div className={styles.soldOverlay}><span>vendido</span></div>
          )}
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={`${styles.badge} ${isAvailable ? styles.badgeAvailable : styles.badgeSold}`}>
              <span className={styles.badgeDot} />
              {isAvailable ? 'disponível' : 'vendido'}
            </span>
          </div>

          <h2 className={styles.title}>{product.title}</h2>

          {product.description && (() => {
            const lines = product.description.split('\n')
            const needsExpand = product.description.length > 120 || lines.length > 3
            return (
              <div className={styles.descriptionWrap}>
                <p className={styles.description}>
                  {lines.slice(0, 3).map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < Math.min(lines.length, 3) - 1 && <br />}
                    </span>
                  ))}
                  {needsExpand && lines.length > 3 && '…'}
                </p>
                {needsExpand && (
                  <button
                    className={styles.expandBtn}
                    onClick={e => { e.stopPropagation(); setExpanded(true) }}
                  >
                    ver descrição completa ↗
                  </button>
                )}
                {expanded && createPortal(
                  <div className={styles.descPopoverOverlay} onClick={() => setExpanded(false)}>
                    <div className={styles.descPopover} onClick={e => e.stopPropagation()}>
                      <div className={styles.descPopoverHeader}>
                        <h3 className={styles.descPopoverTitle}>{product.title}</h3>
                        <button className={styles.descPopoverClose} onClick={() => setExpanded(false)} aria-label="Fechar">
                          <svg viewBox="0 0 20 20" fill="none">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <p className={styles.descPopoverText}>
                        {lines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < lines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            )
          })()}

          {product.price > 0 && (
            <p className={styles.price}>
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          )}

          <div className={styles.actions} style={!(product.price > 0) ? {marginTop:'auto'} : {}}>
            {isAvailable && (
              <button className={styles.ctaBtn} onClick={handleWhatsApp}>
                <svg className={styles.waIcon} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Tenho Interesse
              </button>
            )}

            {product.compareUrl && (
              <a className={styles.compareBtn} href={product.compareUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 3H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M15 3h2v2M17 3l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Comparar novo
              </a>
            )}
          </div>
        </div>
      </article>

      {/* LIGHTBOX */}
      {lightboxIndex !== null && validImages.length > 0 && (
        <Lightbox
          images={validImages}
          startIndex={Math.min(lightboxIndex, validImages.length - 1)}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
