import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { RELEASES, DOWNLOAD, MANIFEST, releaseFromManifest } from './lib/releases'
import './App.css'

const BASE = import.meta.env.BASE_URL
const shot = (name: string) => `${BASE}capturas/actual/${name}.png`
const updateSteps = [
  { id: 'permisos0', title: 'Abre el aviso de actualización', text: 'Cuando la app encuentre una nueva versión, pulsa «Actualizar ahora». También puedes comprobarla desde Ajustes o descargar el APK desde esta web.', alt: 'Aviso de nueva actualización disponible con el botón Actualizar ahora', width: 415, height: 883 },
  { id: 'permisos1', title: 'Entra en Configuración', text: 'Si Android muestra «Se requiere permiso», pulsa «Configuración». El sistema necesita tu autorización para instalar una app desde esta fuente.', alt: 'Diálogo de Android Se requiere permiso con los botones Cancelar y Configuración', width: 414, height: 889 },
  { id: 'permisos2', title: 'Permite esta fuente y vuelve', text: 'Activa «Confiar en esta fuente» o «Permitir desde esta fuente». Regresa a la app y confirma la instalación de la actualización.', alt: 'Ajuste de Android Instalar apps desconocidas con Confiar en esta fuente activado', width: 418, height: 881 },
]
type IconName = 'arrow' | 'download' | 'search' | 'book' | 'calculator' | 'heart' | 'wifi' | 'check' | 'sun' | 'moon' | 'menu' | 'close' | 'chevron' | 'android' | 'shield'

function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    book: <><path d="M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z" /><path d="M6 8h3m6 0h3M6 12h3m6 0h3" /></>,
    calculator: <><rect x="5" y="2" width="14" height="20" rx="3" /><path d="M8 6h8M8 11h1m6 0h1m-8 4h1m6 0h1m-8 4h1m6 0h1" /></>,
    heart: <path d="M20.5 4.5a5 5 0 0 0-7 0L12 6l-1.5-1.5a5 5 0 0 0-7 7L12 20l8.5-8.5a5 5 0 0 0 0-7Z" />,
    wifi: <><path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0M3 3l18 18" /><circle cx="12" cy="20" r=".5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
    moon: <path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    android: <><path d="m7 4-2-2m12 2 2-2M4 11a8 8 0 0 1 16 0v7H4ZM8 18v4m8-4v4M1 11v6m22-6v6" /><path d="M8 8h.01M16 8h.01" /></>,
    shield: <><path d="m12 2 8 3v6c0 5-8 10-8 10s-8-5-8-10V5Z" /><path d="m8 11 3 3 5-5" /></>,
  }
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const screens: { id: string; label: string; icon: IconName; title: string; text: string; details: string[] }[] = [
  { id: 'inicio', label: 'Inicio', icon: 'book', title: 'Un nuevo inicio. Todo más cerca.', text: 'Tu próxima consulta empieza aquí. Una pantalla renovada reúne la búsqueda, los accesos rápidos y tus cálculos recientes.', details: ['Navegación inferior siempre a mano', 'Accesos a favoritos e historial', 'Modo día y modo noche'] },
  { id: 'busqueda', label: 'Búsqueda', icon: 'search', title: 'Encuentra la partida. Sigue el detalle.', text: 'Busca por código o descripción y explora la estructura del arancel, desde las secciones hasta las subpartidas.', details: ['Búsqueda por código o descripción', 'Navegación por la jerarquía arancelaria', 'Tributos, preferencias y documentos relacionados'] },
  { id: 'calculadora', label: 'Calculadora', icon: 'calculator', title: 'De los datos a una estimación clara.', text: 'Selecciona tu partida e ingresa FOB, flete, seguro y otros gastos. Consulta el desglose estimado de tributos en la app.', details: ['Formulario organizado para cada operación', 'Tipo de cambio oficial, referencial o manual', 'Historial para retomar tus cálculos'] },
  { id: 'favoritos', label: 'Favoritos', icon: 'heart', title: 'Tus consultas frecuentes, a mano.', text: 'Guarda las partidas que más utilizas y vuelve a ellas desde la barra de navegación. Menos búsquedas repetidas, más continuidad.', details: ['Partidas guardadas en tu dispositivo', 'Acceso directo desde la barra inferior', 'Detalle de la partida a un toque'] },
  { id: 'temas', label: 'Personalización', icon: 'sun', title: 'La misma herramienta. A tu manera.', text: 'Elige entre cinco colores y cambia entre día y noche. La interfaz y el logo acompañan el tema que prefieras.', details: ['Blanco, jade, azul, terracota y violeta', 'Apariencia clara u oscura', 'Ayudas para entender los términos'] },
]
const questions = [
  { q: '¿La aplicación ya está finalizada?', a: 'No. Arancel Bolivia está en fase beta y sigue en desarrollo. Algunas funciones pueden cambiar y puedes encontrar errores. Tus reportes y sugerencias desde la app ayudan a mejorar las próximas versiones.' },
  { q: '¿Por qué Android pide permiso para instalar apps desconocidas?', a: 'La beta se distribuye mediante un archivo APK fuera de Play Store. Android llama «apps desconocidas» a las instalaciones desde estas fuentes y puede pedir que autorices a quien abre el archivo: el navegador, el gestor de archivos o Arancel Bolivia al actualizar desde la app. La guía de esta página muestra los avisos y el ajuste. Puedes desactivar ese permiso al terminar.' },
  { q: '¿Cómo actualizo si ya tengo la app?', a: 'Puedes comprobar las actualizaciones desde Ajustes en la versión gratuita, o descargar el APK desde esta página. Instálalo sobre la versión existente, sin desinstalarla antes, para conservar tus datos locales. Android comprobará que el paquete y la firma sean compatibles.' },
  { q: '¿Necesito conexión a internet?', a: 'La consulta de la base arancelaria local funciona sin conexión. Las descargas, las actualizaciones, las tasas de cambio en línea y los envíos de comentarios necesitan internet. En la calculadora también puedes introducir una tasa manual.' },
  { q: '¿La descarga es gratuita? ¿Tiene publicidad?', a: 'La descarga de esta página corresponde a la versión gratuita para Android, que incluye publicidad. Puedes consultar la política de privacidad y los términos de esta edición antes de instalarla.' },
  { q: '¿Es una aplicación oficial de la Aduana?', a: 'No. Es una aplicación independiente desarrollada como proyecto de grado. No representa a la Aduana Nacional ni a ninguna entidad pública. Las consultas y los cálculos son orientativos; verifica la normativa y los datos aplicables a tu operación.' },
  { q: '¿Está disponible para iPhone?', a: 'La descarga que ofrecemos aquí es un archivo APK para Android. Actualmente esta página no distribuye una versión para iPhone.' },
]

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [screen, setScreen] = useState(0)
  const [night, setNight] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState<{ src: string; title: string; caption: string } | null>(null)
  const [download, setDownload] = useState({ url: DOWNLOAD, version: '', status: 'loading' as 'loading' | 'live' | 'fallback' })
  const [retry, setRetry] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const galleryTrigger = useRef<HTMLButtonElement | null>(null)
  const selected = screens[screen]
  const screenshot = screen === 0 && night ? 'inicio-oscuro' : selected.id

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    let mounted = true
    async function resolveRelease() {
      setDownload(previous => ({ ...previous, status: 'loading' }))
      try {
        const response = await fetch(MANIFEST, { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Manifest unavailable')
        const release = releaseFromManifest(await response.json())
        if (!release) throw new Error('Invalid download manifest')
        if (mounted) setDownload({ ...release, status: 'live' })
      } catch { if (mounted) setDownload({ url: DOWNLOAD, version: '', status: 'fallback' }) }
      finally { window.clearTimeout(timeout) }
    }
    void resolveRelease()
    return () => { mounted = false; controller.abort(); window.clearTimeout(timeout) }
  }, [retry])

  useEffect(() => {
    if (!galleryOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGalleryOpen(null)
      if (event.key === 'Tab') { event.preventDefault(); closeRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener('keydown', onKey); galleryTrigger.current?.focus() }
  }, [galleryOpen])

  const closeMenu = () => setMenuOpen(false)
  const openGallery = (trigger: HTMLButtonElement, capture = { src: shot(screenshot), title: selected.label, caption: 'Interfaz actual con datos de ejemplo' }) => { galleryTrigger.current = trigger; setGalleryOpen(capture) }
  const downloadButton = (label = 'Descargar beta para Android', className = '') => <a className={`button button-primary ${className}`} href={download.url}><Icon name="download" /><span>{label}</span><Icon name="arrow" /></a>

  return <div className="page-shell">
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header"><div className="nav container">
      <a href="#inicio" className="brand" aria-label="Arancel Bolivia beta, inicio" onClick={closeMenu}><img src={`${BASE}brand/logo-jade.webp`} width="44" height="44" alt="" /><span>Arancel Bolivia<small>2026 · Beta · No oficial</small></span></a>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} id="main-navigation" aria-label="Navegación principal"><a href="#novedades" onClick={closeMenu}>La nueva app</a><a href="#explorar" onClick={closeMenu}>Explorar</a><a href="#instalacion" onClick={closeMenu}>Instalación</a><a href="#preguntas" onClick={closeMenu}>Preguntas</a></nav>
      <a className="nav-cta" href="#descargar" onClick={closeMenu}>Descargar APK <Icon name="download" /></a>
      <button className="menu-button" type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)} onKeyDown={event => { if (event.key === 'Escape') closeMenu() }}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
    </div></header>
    <main id="contenido">
      <section className="hero container" id="inicio"><div className="hero-copy">
        <a href="#novedades" className="announcement"><span className="status-dot" /> Beta pública · Nueva interfaz en desarrollo <Icon name="arrow" /></a>
        <h1>Tu próxima<br />consulta,<br /><span>más sencilla.</span></h1>
        <p className="hero-lead">El arancel de Bolivia, en tu bolsillo. Prueba la nueva interfaz para consultar partidas, organizar favoritos y estimar tributos. Una beta que sigue creciendo con tus comentarios.</p>
        <div className="hero-actions">{downloadButton()}<a className="link-arrow" href="#explorar">Conoce la app <Icon name="arrow" /></a></div>
        <div className="hero-meta"><span><Icon name="android" /> Para Android</span><span><Icon name="check" /> Beta gratuita</span><span><Icon name="wifi" /> Base local sin conexión</span></div>
        <p className="beta-notice">En fase beta: la app aún no está finalizada y puede presentar errores.</p>
      </div><div className="hero-stage" aria-label="Vista previa de la nueva aplicación"><div className="stage-grid" aria-hidden="true" /><div className="stage-ring ring-one" aria-hidden="true" /><div className="stage-ring ring-two" aria-hidden="true" />
        <div className="hero-phone-back"><img src={shot('inicio-oscuro')} width="780" height="1688" alt="Inicio de Arancel Bolivia en modo noche" /></div>
        <div className="phone hero-phone"><img src={shot('inicio')} width="780" height="1688" alt="Nueva pantalla de inicio con búsqueda, accesos rápidos y navegación inferior" fetchPriority="high" /></div>
        <div className="floating-note note-top"><span className="note-icon"><Icon name="search" /></span><span>Todo empieza con<br /><strong>una buena búsqueda.</strong></span></div>
        <div className="floating-note note-bottom"><span className="note-icon"><Icon name="wifi" /></span><span>Tu base arancelaria.<br /><strong>Incluso sin señal.</strong></span><span className="mini-dot" /></div>
        <span className="stage-caption">DISEÑADA PARA ACOMPAÑARTE.</span>
      </div></section>

      <div className="trust-strip"><div className="container trust-inner"><span>Información a mano.<br /><strong>Donde estés.</strong></span><div><Icon name="book" /><p>Arancel boliviano<small>Base de consulta 2026</small></p></div><div><Icon name="calculator" /><p>Tributos estimados<small>Desglose en la app</small></p></div><div><Icon name="heart" /><p>A tu ritmo<small>Favoritos e historial</small></p></div></div></div>

      <section className="section container" id="novedades"><div className="section-heading"><div><p className="eyebrow"><span /> UNA NUEVA FORMA DE CONSULTAR</p><h2>Más intuitiva.<br /><span>Más tuya.</span></h2></div><p>Rediseñamos la experiencia para que encuentres lo que necesitas y tengas tus herramientas siempre cerca.</p></div>
        <div className="updates-grid"><article className="update-card update-main"><span className="card-index">01 / NAVEGACIÓN</span><h3>Lo importante,<br />a un toque.</h3><p>Muévete entre inicio, búsqueda, calculadora, favoritos y ajustes desde la nueva barra inferior.</p><div className="nav-illustration" aria-hidden="true">{(['heart', 'search', 'book', 'calculator', 'sun'] as IconName[]).map((name, index) => <span className={index === 2 ? 'active' : ''} key={name}><Icon name={name} /></span>)}</div><a className="link-arrow" href="#explorar">Explora las pantallas <Icon name="arrow" /></a></article>
          <article className="update-card update-theme"><span className="card-index">02 / TU ESTILO</span><div className="theme-orbits" aria-hidden="true"><Icon name="sun" /><Icon name="moon" /></div><h3>De día. De noche.<br />De tu color.</h3><p>Cinco colores, dos modos y logos que acompañan tu elección.</p><div className="palette" aria-label="Colores: blanco, jade, azul, terracota y violeta">{['#ffffff', '#129b8b', '#1769aa', '#b85c38', '#7b4fa1'].map(color => <span style={{ background: color }} key={color} />)}</div></article>
          <article className="update-card update-local"><span className="card-index">03 / CONTINUIDAD</span><Icon name="heart" className="large-icon" /><h3>Guarda. Retoma.<br />Continúa.</h3><p>Tus favoritos y tu historial te ayudan a volver a lo que importa, sin empezar desde cero.</p><span className="local-tag"><span className="status-dot" /> En tu dispositivo</span></article></div>
      </section>

      <section className="explore-section" id="explorar"><div className="container"><div className="section-heading"><div><p className="eyebrow"><span /> CONOCE LA APP POR DENTRO</p><h2>Una pantalla para<br /><span>cada paso.</span></h2></div><p>Explora la nueva interfaz antes de instalarla. Selecciona una función para ver cómo se siente.</p></div>
        <div className="screen-selector" role="group" aria-label="Selecciona una pantalla de la aplicación">{screens.map((item, index) => <button type="button" className={index === screen ? 'screen-option active' : 'screen-option'} aria-pressed={index === screen} key={item.id} onClick={() => setScreen(index)}><Icon name={item.icon} />{item.label}</button>)}</div>
        <div className="screen-showcase"><div className="screen-copy" key={selected.id}><span className="screen-counter">0{screen + 1}<span> / 05</span></span><h3>{selected.title}</h3><p>{selected.text}</p><ul className="check-list">{selected.details.map(detail => <li key={detail}><Icon name="check" />{detail}</li>)}</ul>{screen === 0 && <div className="mode-switch" role="group" aria-label="Apariencia de la captura de inicio"><button type="button" aria-pressed={!night} onClick={() => setNight(false)}><Icon name="sun" />Día</button><button type="button" aria-pressed={night} onClick={() => setNight(true)}><Icon name="moon" />Noche</button></div>}<button type="button" className="link-arrow enlarge-button" onClick={event => openGallery(event.currentTarget)}>Ampliar captura <Icon name="search" /></button></div>
          <figure className="showcase-figure"><div className="showcase-halo" aria-hidden="true" /><button className="phone screenshot-button" type="button" aria-label={`Ampliar pantalla de ${selected.label}`} onClick={event => openGallery(event.currentTarget)}><img key={screenshot} src={shot(screenshot)} width="780" height="1688" alt={`Interfaz actual de ${selected.label}${screen === 0 ? night ? ', modo noche' : ', modo día' : ''}`} loading="lazy" /></button><figcaption>Interfaz actual · Datos de ejemplo</figcaption></figure></div>
      </div></section>

      <section className="section container install-section" id="instalacion"><div className="section-heading"><div><p className="eyebrow"><span /> INSTALA Y ACTUALIZA LA BETA</p><h2>De la descarga<br /><span>a tu celular.</span></h2></div><p>La beta gratuita se distribuye como APK fuera de Play Store. Android puede pedirte permiso para instalar aplicaciones desconocidas.<br /><a className="link-arrow" href="#permisos">Ver los permisos paso a paso <Icon name="arrow" /></a></p></div>
        <ol className="install-grid">{[
          { number: '01', icon: 'download' as IconName, title: 'Descarga el APK', text: 'Usa el botón de descarga y guarda el archivo en tu teléfono Android.' },
          { number: '02', icon: 'shield' as IconName, title: 'Autoriza la instalación', text: 'Abre el archivo. Si Android lo pide, permite a tu navegador o gestor de archivos instalar esta app.' },
          { number: '03', icon: 'check' as IconName, title: 'Abre y explora', text: 'Completa la instalación y abre Arancel Bolivia. Si ya la tienes, instala encima para actualizar.' },
        ].map(step => <li key={step.number}><div className="install-top"><span>{step.number}</span><Icon name={step.icon} /><Icon name="arrow" /></div><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
        <div className="update-guide" id="permisos">
          <div className="update-guide-heading"><p className="eyebrow"><span /> GUÍA VISUAL DE ACTUALIZACIÓN</p><h3>¿La app te pide permiso?</h3><p>Estos son los avisos que puedes encontrar al actualizar desde la aplicación. Toca una captura para verla más grande.</p></div>
          <ol className="permission-steps">{updateSteps.map((step, index) => <li key={step.id}>
            <div className="permission-copy"><span className="permission-number">0{index + 1}</span><h4>{step.title}</h4><p>{step.text}</p></div>
            <button type="button" className="permission-capture" aria-label={`Ampliar: ${step.title}`} onClick={event => openGallery(event.currentTarget, { src: `${BASE}capturas/${step.id}.png`, title: step.title, caption: 'Guía de actualización · Captura de una versión anterior' })}><span className="permission-device"><img src={`${BASE}capturas/${step.id}.png`} width={step.width} height={step.height} alt={step.alt} loading="lazy" /></span><span className="capture-label"><Icon name="search" /> Ampliar captura</span></button>
          </li>)}</ol>
          <p className="permission-caption">Capturas de una versión anterior: ilustran los permisos de Android. La versión y el aspecto de los avisos pueden variar en tu dispositivo.</p>
        </div>
        <div className="install-note"><Icon name="shield" /><p>«Apps desconocidas» es el nombre que Android da a las instalaciones desde fuera de la tienda. Autoriza la fuente desde la que abres este APK: puede ser Arancel Bolivia al actualizar, tu navegador o tu gestor de archivos. Puedes desactivar el permiso al terminar.</p></div>
      </section>

      <section className="download-section container" id="descargar"><div className="download-content"><p className="eyebrow"><span /> BETA PÚBLICA · EN DESARROLLO</p><h2>Prueba la beta.<br /><span>Ayúdanos a mejorar.</span></h2><p>Explora la nueva interfaz de Arancel Bolivia y comparte tus sugerencias desde la app. Todavía está en fase de pruebas: puedes encontrar errores y funciones que cambien en próximas versiones.</p><div className="download-actions">{downloadButton('Descargar APK beta', 'button-mint')}<a className="release-link" href={RELEASES} target="_blank" rel="noopener noreferrer">Ver versiones en GitHub <Icon name="arrow" /></a></div><div className="download-status" role="status">{download.status === 'loading' ? 'Consultando la versión beta disponible…' : download.status === 'live' ? `${download.version ? `Beta ${download.version} · ` : ''}Enlace obtenido del catálogo de versiones` : <>El catálogo no respondió. El botón sigue disponible con el enlace de última versión en GitHub. <button type="button" onClick={() => setRetry(value => value + 1)}>Reintentar</button></>}</div><div className="download-meta"><span><Icon name="android" />Android · Archivo APK</span><span>Beta gratuita con publicidad</span></div></div><div className="download-art" aria-hidden="true"><span className="download-orbit" /><img src={`${BASE}brand/logo-jade.webp`} width="220" height="220" alt="" loading="lazy" /><span className="art-label">ARANCEL BOLIVIA<span>2026 / BETA / NO OFICIAL</span></span></div></section>

      <section className="section container faq-section" id="preguntas"><div className="faq-intro"><p className="eyebrow"><span /> ANTES DE EMPEZAR</p><h2>Preguntas<br /><span>frecuentes.</span></h2><p>Lo que necesitas saber sobre la descarga, la instalación y el uso de la app.</p></div><div className="faq-list">{questions.map(item => <details key={item.q}><summary>{item.q}<Icon name="chevron" /></summary><p>{item.a}</p></details>)}</div></section>

      <section className="project-band" id="proyecto"><div className="container project-inner"><div><span className="eyebrow">HECHO EN BOLIVIA · EN FASE BETA</span><h2>Un proyecto que<br />sigue creciendo contigo.</h2></div><div><p>Arancel Bolivia nace como proyecto de grado para acercar la información arancelaria a quienes la consultan cada día. La aplicación aún está en desarrollo. Tus comentarios desde la beta nos ayudan a mejorar la experiencia.</p><p className="independent-note">Aplicación independiente y no oficial. No representa a ninguna entidad pública. Los cálculos son estimaciones orientativas.</p></div></div></section>
    </main>
    <footer className="site-footer container"><div className="footer-top"><a href="#inicio" className="brand"><img src={`${BASE}brand/logo-jade.webp`} width="40" height="40" alt="" /><span>Arancel Bolivia<small>2026 · Beta · No oficial</small></span></a><nav aria-label="Información legal"><a href={`${BASE}politica-privacidad-gratuita.html`}>Privacidad</a><a href={`${BASE}terminos-y-condiciones-gratuita.html`}>Términos de uso</a><a href={`${BASE}licencias-terceros.html`}>Licencias</a></nav><a className="back-top" href="#inicio" aria-label="Volver al inicio"><Icon name="arrow" /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ArtyomStkr y colaboradores.</span><span>Proyecto de grado · Bolivia</span><a href={RELEASES} target="_blank" rel="noopener noreferrer">Repositorio de descargas <Icon name="arrow" /></a></div></footer>
    <div className="mobile-download"><span>Arancel Bolivia<small>Android · Beta pública</small></span><a className="button button-primary" href="#descargar">Descargar beta<Icon name="download" /></a></div>
    {galleryOpen && <div className="lightbox" role="dialog" aria-modal="true" aria-label={`Captura ampliada: ${galleryOpen.title}`} onClick={event => { if (event.target === event.currentTarget) setGalleryOpen(null) }}><button ref={closeRef} className="lightbox-close" type="button" onClick={() => setGalleryOpen(null)} aria-label="Cerrar captura ampliada"><Icon name="close" /></button><img src={galleryOpen.src} alt={galleryOpen.title} /><p>{galleryOpen.title} · {galleryOpen.caption}</p></div>}
  </div>
}
export default App
