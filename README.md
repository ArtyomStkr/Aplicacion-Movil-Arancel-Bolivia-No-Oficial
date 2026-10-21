# Arancel Bolivia · Web de descarga

Sitio de presentación y descarga de la **beta de Arancel Bolivia 2026 · No oficial**, desarrollado con React, TypeScript y Vite. La aplicación sigue en desarrollo. Mantiene el despliegue existente en GitHub Pages y su ruta base `/Aplicacion-Movil-Arancel-Bolivia-No-Oficial/`.

## Desarrollo

Requiere Node.js 22.18 o superior (las pruebas usan el soporte nativo de TypeScript).

```sh
npm ci
npm run dev
npm run test
npm run build
```

`npm run preview` sirve el contenido generado en `dist/`. El flujo `.github/workflows/deploy-pages.yml` publica al recibir cambios en `main`; editar o compilar localmente no publica el sitio.

## Experiencia

- Diseño adaptable para móvil, tableta y escritorio; menú móvil y acceso fijo a la descarga en teléfonos.
- Galería de inicio, búsqueda, calculadora, favoritos y configuración, con comparación día/noche para inicio.
- Capturas ampliables, cierre con Escape y devolución del foco al control que abrió la imagen.
- Animaciones de entrada, desplazamiento y detalles flotantes; se respeta `prefers-reduced-motion`.
- Guía de instalación, preguntas frecuentes y enlaces a los documentos legales de la edición gratuita.
- Guía visual de actualización con las tres capturas originales: aviso de actualización, solicitud de permiso y ajuste «Confiar en esta fuente». También se pueden ampliar. Se identifican como capturas de una versión anterior.
- Las imágenes conservan su relación de aspecto con altura automática; las capturas de la portada no heredan la altura fija del archivo original al reducirse de ancho.
- Los bordes cuadrados de las capturas de permisos se ocultan mediante un marco redondeado en CSS, también al ampliarlas. Los archivos originales se conservan intactos.

## Descargas

`src/lib/releases.ts` centraliza las direcciones públicas. La página consulta `latest.json` del repositorio `ArtyomStkr/arancel_bob_releases`, prioriza `githubUrl` y acepta `apkUrl` como alternativa. Solo acepta APK por HTTPS dentro de ese repositorio. La versión se muestra únicamente cuando el catálogo devuelve un dato válido.

Tras ocho segundos o ante una respuesta inválida se conserva el enlace estable de última versión en GitHub y se ofrece reintentar. No se almacena ni se distribuye el APK dentro de este repositorio. Las pruebas verifican el manifiesto actual, la alternativa RAW, destinos inválidos y el enlace de respaldo.

## Actualizar las capturas

Las seis imágenes en `public/capturas/actual/` se renderizaron desde las pantallas Flutter del proyecto hermano `../arancel_bob_v2`, a 390 × 844 puntos y resolución doble. Se usan datos controlados de ejemplo y la paleta Jade. No son capturas de un teléfono físico: el proceso monta las pantallas reales con el runner de Flutter.

Desde la raíz de esta web, con el SDK Flutter y las dependencias de la app ya instalados:

```powershell
./scripts/capture-app.ps1 -AppPath '../arancel_bob_v2'
```

El script utiliza el arnés `test/ui_adaptable_test.dart` de la aplicación, copia sus fuentes y recursos a `.preview-app/` (ignorado por Git), renderiza las pantallas y copia los PNG resultantes. La fuente Roboto se carga explícitamente para que el runner no dibuje su fuente de pruebas Ahem en los formularios. La aplicación original no se modifica. Si cambia el arnés de la aplicación, hay que actualizar el script.

Los logos actuales se conservan en `public/brand/` y provienen de `lib/tema/logos/` de la app. Las capturas anteriores permanecen disponibles, pero la portada y sus metadatos usan la nueva interfaz.

## Verificación de esta actualización

- Compilación de producción y cinco pruebas del manifiesto completadas.
- Seis renders de Flutter completados y capturas inspeccionadas.
- Catálogo público y enlace de descarga del APK comprobados (versión 0.3.3).
- Revisada la corrección de proporciones en el navegador integrado con vistas de 320, 391, 768 y 1440 píxeles, sin desbordamiento horizontal. Comprobados el menú móvil, las tres imágenes de permisos y su ampliación/cierre. La vista previa debe estar ejecutándose para que el navegador pueda acceder a ella.
