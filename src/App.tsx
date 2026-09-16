import { useEffect, useState } from 'react'
import './App.css'

const ASSET_BASE = import.meta.env.BASE_URL

function App() {
  const [activeStep, setActiveStep] = useState(0)
  const [downloadUrl, setDownloadUrl] = useState(FALLBACK_DOWNLOAD_URL)

  useEffect(() => {
    resolveLatestDownload().then(setDownloadUrl).catch(() => undefined)
  }, [])

  useEffect(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('#signal-canvas')
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    let frame = 0
    let animationId = 0
    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * ratio
      canvas.height = canvas.clientHeight * ratio
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const draw = () => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      context.clearRect(0, 0, width, height)
      context.strokeStyle = 'rgba(235, 238, 230, .13)'
      context.lineWidth = 1
      for (let x = 0; x < width; x += 42) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke() }
      for (let y = 0; y < height; y += 42) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke() }
      context.strokeStyle = '#d1ff45'
      context.lineWidth = 2
      context.beginPath()
      for (let x = 0; x <= width; x += 5) {
        const y = height * .5 + Math.sin(x * .018 + frame * .025) * 18 + Math.sin(x * .047 + frame * .012) * 8
        x === 0 ? context.moveTo(x, y) : context.lineTo(x, y)
      }
      context.stroke()
      for (let index = 0; index < 3; index += 1) {
        const x = width * (.18 + index * .3)
        const y = height * .5 + Math.sin(x * .018 + frame * .025) * 18 + Math.sin(x * .047 + frame * .012) * 8
        context.fillStyle = index === 1 ? '#fffdf5' : '#d1ff45'
        context.beginPath(); context.arc(x, y, 4, 0, Math.PI * 2); context.fill()
      }
      frame += 1
      animationId = requestAnimationFrame(draw)
    }
    resize(); draw(); window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', resize) }
  }, [])

  const steps = [
    { number: '01', title: 'Aviso de actualización', text: 'La app te informa cuando hay una nueva versión disponible para instalar manualmente.', label: 'Nueva versión disponible', visual: '↻' },
    { number: '02', title: 'Permitir fuentes desconocidas', text: 'Android solicitará autorizar la instalación fuera de Play Store para continuar con la actualización.', label: 'Permiso de Android', visual: '⚙' },
    { number: '03', title: 'Habilitar permiso y actualizar', text: 'Activa el permiso una vez, vuelve a la app y completa la actualización de Arancel BOB.', label: 'Instalación manual', visual: '✓' },
  ]

  const features = [
    { icon: '11K+', title: 'Partidas arancelarias', text: 'Más de 11.000 partidas de Bolivia organizadas para consultar por código o descripción.' },
    { icon: 'BOB', title: 'Calculadora de tributos', text: 'Estima tus tributos aduaneros con una conversión clara y orientada a cada consulta.' },
    { icon: '↔', title: 'Cambio flexible', text: 'Usa cambio referencial, cambio oficial o introduce manualmente tu propia tasa BOB / USD.' },
    { icon: '⌁', title: 'Feedback desde la app', text: 'Envía sugerencias, consultas o reportes para ayudarnos a mejorar la beta.' },
  ]

  return <div className="page-shell">
    <header className="nav"><a className="wordmark" href="#inicio"><img src={`${ASSET_BASE}logo.png`} alt="" /><strong>Aranceles Bolivia <i>2026 no Oficial</i></strong></a><nav><a href="#como-funciona">Instalación</a><a href="#capacidades">Funciones</a><a href="#proyecto">El proyecto</a></nav><a className="nav-download" href={downloadUrl} download>Descargar <b>↗</b></a></header>
    <main>
      <section className="hero section" id="inicio"><div className="hero-copy reveal"><p className="eyebrow"><span className="live-dot" /> Bolivia · Aranceles 2026</p><h1>Consulta y calcula<br /><em>desde tu celular.</em></h1><p className="hero-lead"><strong>Aplicación Móvil de Consultas de Partidas Arancelarias de Bolivia y Calculadora de Tributos Aduaneros.</strong> Una herramienta clara para decidir mejor, incluso cuando estás lejos de tu escritorio.</p><div className="hero-actions"><a className="button button-primary" href={downloadUrl} download><span className="download-icon">↓</span> Descargar para Android</a><a className="text-link" href="#como-funciona">Ver instalación <span>→</span></a></div><p className="microcopy">Beta pública · Android 8.0 o superior · Gratis</p><p className="unofficial-notice"><span>!</span> Aplicación independiente, no oficial</p></div><div className="hero-visual reveal-delay"><div className="stamp">HECHO<br /><strong>EN BOLIVIA</strong><br /><small>2026 / BETA</small></div><div className="hero-app-shot"><img className="device-image" src={`${ASSET_BASE}capturas/principal.png`} alt="Pantalla principal de Arancel BOB" /></div><div className="orbit orbit-one" /><div className="orbit orbit-two" /></div></section>
      <section className="signal-band"><div><h2>Menos vueltas.<br /><span>Más claridad.</span></h2></div><div className="signal-info"><p>La información que necesitas, ordenada para el momento exacto en que la necesitas.</p><div className="signal-data"><span><b className="signal-pulse" /> BASE BOLIVIANA</span><strong>+11.000</strong><small>partidas arancelarias</small></div><div className="offline-note"><span>◉</span><strong>Funciona sin conexión</strong><small>Consulta la base local sin consumir datos.</small></div></div><canvas id="signal-canvas" aria-label="Visualización animada de datos" /></section>
      <section className="steps section" id="como-funciona"><div className="section-heading"><div><h2>Actualiza con<br /><em>confianza.</em></h2></div><p>Como todavía no estamos en plataformas oficiales como Play Store, las actualizaciones requieren habilitar temporalmente el permiso de instalación desde fuentes desconocidas.</p></div><div className="steps-grid">{steps.map((step, index) => <button className={`step-card ${activeStep === index ? 'selected' : ''}`} key={step.number} type="button" onClick={() => setActiveStep(index)}><span className="step-number">{step.number}</span><span className={`step-visual visual-${index + 1}`}>{step.visual}</span><strong>{step.title}</strong><p>{step.text}</p><small>{step.label}</small></button>)}</div><div className="capture-strip"><Capture src={`${ASSET_BASE}capturas/permisos0.png`} title="Aviso de actualización" /><Capture src={`${ASSET_BASE}capturas/permisos1.png`} title="Permitir fuentes desconocidas" /><Capture src={`${ASSET_BASE}capturas/permisos2.png`} title="Habilitar permiso y actualizar" /></div></section>
      <section className="features section" id="capacidades"><div className="section-heading"><div><h2>Una app para<br /><em>cada consulta.</em></h2></div><p>Herramientas concretas para revisar partidas, estimar tributos y trabajar con el tipo de cambio que corresponde a tu operación.</p></div><div className="feature-grid">{features.map((feature) => <article className="feature-card" key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.text}</p></article>)}</div><div className="calculator-guide"><Capture src={`${ASSET_BASE}capturas/calcu.png`} title="Calculadora de tributos aduaneros" /><div className="calculator-copy"><span className="guide-kicker">Calculadora de tributos</span><h3>Del valor de compra<br /><em>al resultado.</em></h3><p>Completa los datos de tu operación y deja que la app haga el cálculo.</p><ol><li><b>Selecciona la partida arancelaria</b><span>Busca y elige el código que corresponde a tu mercancía.</span></li><li><b>Ingresa FOB, flete y seguro</b><span>Registra cada valor de la operación en dólares estadounidenses.</span></li><li><b>Elige el tipo de cambio</b><span>Usa cambio referencial, oficial o introduce una tasa manual.</span></li><li><b>Presiona calcular</b><span>Recibe el resultado estimado de tus tributos aduaneros.</span></li></ol></div></div></section>
      <section className="beta-section section" id="beta"><div className="beta-copy"><h2>Tu experiencia<br /><em>mejora la app.</em></h2><p>La app ya cuenta con una función integrada para enviar feedback. Escribe un alias o nombre, selecciona una categoría y describe tu experiencia: puedes reportar errores, enviar sugerencias o compartir otros comentarios. Presiona enviar y ya estás ayudando a mejorar la beta.</p><a className="button button-light" href="#inicio">Participar y descargar <span>↑</span></a></div><div className="beta-visual"><div className="hero-app-shot beta-app-shot"><img className="device-image" src={`${ASSET_BASE}capturas/feed.png`} alt="Pantalla de feedback de Arancel BOB durante la prueba beta" /></div></div></section>
      <section className="project section" id="proyecto"><div className="project-title"><h2>Un proyecto<br /><em>que se defiende.</em></h2></div><div className="project-copy"><p>Es una Aplicación Móvil de Consultas de Partidas Arancelarias de Bolivia y Calculadora de Tributos Aduaneros, desarrollada como proyecto de grado y para su respectiva defensa académica. Nace para acercar la información aduanera a las personas que la usan todos los días.</p><p>La app reúne partidas arancelarias 2026, tributos, notas legales, criterios y una calculadora con cambio referencial, oficial o manual. El proyecto sigue creciendo con el feedback de sus primeros usuarios.</p><div className="project-meta"><span><b>01</b> Base local</span><span><b>02</b> Consulta sin señal</span><span><b>03</b> Proyecto de grado</span><span><b>04</b> Feedback abierto</span></div></div></section>
    </main>
    <footer><div className="footer-main"><a className="wordmark" href="#inicio"><img src={`${ASSET_BASE}logo.png`} alt="" /><strong>Aranceles Bolivia <i>2026 no Oficial</i></strong></a><p>Una herramienta abierta para entender mejor.</p><a className="footer-download" href={downloadUrl} download>Descargar APK <b>↗</b></a></div><div className="footer-legal"><span>© 2026 Aranceles Bolivia 2026 no Oficial</span><span>Proyecto de grado · Bolivia</span><strong>Aplicación independiente y no oficial.</strong><span>Derechos reservados a ArtyomStkr y colaboradores.</span><span><a href="#proyecto">Acerca del proyecto</a> · <a href="#beta">Participar en la beta</a></span></div></footer>
  </div>
}

function Capture({ src = `${ASSET_BASE}capturas/proba.png`, title }: { src?: string; title: string }) {
  return <figure className="capture"><div className="capture-frame"><img src={src} alt={`Pantalla de ${title}`} /></div><figcaption>{title}</figcaption></figure>
}

const LATEST_MANIFEST_URL = 'https://raw.githubusercontent.com/ArtyomStkr/arancel_bob_releases/main/latest.json'
const FALLBACK_DOWNLOAD_URL = 'https://github.com/ArtyomStkr/arancel_bob_releases/releases/download/v2.0.1/Arancel.Bolivia.2026.apk'

async function resolveLatestDownload() {
  try {
    const response = await fetch(`${LATEST_MANIFEST_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (response.ok) {
      const manifest = await response.json() as { githubUrl?: string; apkUrl?: string }
      const manifestUrl = manifest.githubUrl || manifest.apkUrl
      if (manifestUrl) return manifestUrl
    }
  } catch { /* Use the stable GitHub Pages APK URL below. */ }

  return FALLBACK_DOWNLOAD_URL
}

export default App
