# Espartano — Documentación técnica

> Catálogo web de accesorios masculinos con panel de administración propio.
> El cierre de venta no ocurre en el sitio: cada producto enlaza a WhatsApp.

---

## 1. Resumen del proyecto

**Espartano** (`espartano`) es una tienda-vitrina de una sola página pública más un panel
administrativo privado. No hay carrito, checkout ni pasarela de pagos: el visitante navega el
catálogo y, al interesarse por un producto, es enviado a WhatsApp con un mensaje pre-cargado.
El pago se realiza por **Pago Móvil venezolano**, cuyos datos se muestran en el sitio y se
editan desde el panel.

Todo el contenido editable (textos del hero, barra de anuncios, features de delivery,
categorías, datos de pago y productos) vive en **Firestore** y se administra desde
`/admin/dashboard`, sin necesidad de tocar código ni redesplegar.

| | |
|---|---|
| **Framework** | Next.js `16.2.4` (App Router) |
| **UI** | React `19.2.4` + TypeScript `5` |
| **Base de datos** | Firebase Firestore (`firebase` `^12.12.0`, SDK cliente) |
| **Almacenamiento de imágenes** | UploadThing (`uploadthing` `^7.7.4`, `@uploadthing/react` `^7.3.3`) |
| **Estilos** | CSS global con custom properties + `styled-jsx` por componente |
| **Canal de venta** | WhatsApp (`+58 414-585-1705`) |
| **Idioma del sitio** | Español (`<html lang="es">`) |

> 🏛️ **Nota de marca.** El proyecto nació como *Kratos Store* y fue renombrado a **ESPARTANO**
> (ver §12). El repositorio y la carpeta siguen llamándose `kratosvzla` por compatibilidad con
> el remoto de git; el nombre del paquete en `package.json` sí es `espartano`.

> ⚠️ Esta versión de Next.js introduce cambios de API respecto a versiones previas.
> Antes de escribir código nuevo, consultá `node_modules/next/dist/docs/` (indicación de `AGENTS.md`).

---

## 2. Estructura de carpetas

```
kratosvzla/
├── AGENTS.md / CLAUDE.md        Instrucciones para agentes de IA
├── next.config.ts               Config de next/image (remotePatterns)
├── tsconfig.json                Alias "@/*" → ./src/*
├── eslint.config.mjs
├── logoPagina/                  Imagen fuente del logo (JPEG original, 810x1080)
├── public/                      Assets de marca (§8) + SVGs sin usar de create-next-app
├── documentacion/               ← esta documentación
└── src/
    ├── app/
    │   ├── layout.tsx           Root layout: metadata SEO/OG + botón flotante de WhatsApp
    │   ├── favicon.ico          Favicon multi-resolución (16→256 px)
    │   ├── icon.png             Ícono de app 512x512 (convención de archivos de Next)
    │   ├── apple-icon.png       Ícono para iOS 180x180
    │   ├── globals.css          Design tokens + todas las clases compartidas (426 líneas)
    │   ├── page.tsx             Home pública (client component)
    │   ├── actions/
    │   │   └── uploadthing.ts   Server Action: borrado de imágenes en UploadThing
    │   ├── api/uploadthing/
    │   │   ├── core.ts          FileRouter (endpoint `imageUploader`)
    │   │   └── route.ts         Route handlers GET/POST
    │   └── admin/
    │       ├── page.tsx         Login por contraseña
    │       └── dashboard/
    │           ├── layout.tsx   Guard de sesión + sidebar de navegación
    │           ├── page.tsx     Home del panel (estadísticas + accesos rápidos)
    │           ├── products/    Alta, edición, publicación y borrado de productos
    │           ├── content/     Editor del contenido del sitio (4 pestañas)
    │           └── payments/    Datos de Pago Móvil
    ├── components/client/       Secciones de la home (todas 'use client')
    │   ├── Navbar.tsx           Nav fija, cambia al hacer scroll, menú móvil
    │   ├── AnnouncementBar.tsx  Ticker infinito de mensajes
    │   ├── HeroSection.tsx      Hero con imagen de fondo y animación por palabra
    │   ├── ProductCatalog.tsx   Buscador + tabs de categoría + grilla de productos
    │   ├── DeliverySection.tsx  Features de envío
    │   ├── PaymentSection.tsx   Tarjeta de Pago Móvil con copiar-al-portapapeles
    │   └── Footer.tsx
    └── lib/
        ├── firebase.ts          Inicialización del SDK (solo Firestore)
        ├── firebaseUtils.ts     Toda la capa de acceso a datos + contenido por defecto
        ├── types.ts             Interfaces del dominio
        └── uploadthing.ts       Helpers tipados de UploadThing
```

---

## 3. Modelo de datos

Definido en `src/lib/types.ts`.

### `Product` → colección `products`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `string` | ID del documento de Firestore |
| `name` | `string` | Al subir una imagen se autogenera desde el nombre del archivo |
| `price` | `number` | USD. Arranca en `0` |
| `originalPrice` | `number?` | Precio tachado opcional |
| `description` | `string` | |
| `category` | `string` | Debe coincidir con un valor de `SiteContent.categories` |
| `images` | `string[]` | URLs de UploadThing |
| `inStock` | `boolean` | |
| `featured` | `boolean` | Se guarda, pero hoy no se usa en la UI |
| `discount` | `number?` | Porcentaje; genera el badge `-N%` y el precio calculado |
| `createdAt` / `updatedAt` | `Date \| string` | `serverTimestamp()` al escribir |
| `status` | `'draft' \| 'published'` | Solo `published` aparece en la tienda |

### `PaymentInfo` → documento `settings/payment`

`bank`, `phone`, `cedula`, `holderName`, `updatedAt`.

### `SiteContent` → documento `settings/siteContent`

```ts
{
  hero: { title, subtitle, backgroundImage, ctaText },
  announcementBar: { messages: string[], isVisible: boolean },
  delivery: { title, subtitle, features: { icon, title, description }[] },
  categories: string[]
}
```

`defaultSiteContent` (en `firebaseUtils.ts`) es el fallback usado cuando el documento no existe
o Firestore falla: define la marca "ESPARTANO", 4 mensajes de anuncio, 4 features de envío y
7 categorías (Relojes, Billeteras, Cinturones, Lentes, Cadenas, Pulseras, Anillos).

> ⚠️ **El default sólo aplica si el documento no existe.** Si `settings/siteContent` ya está
> guardado en Firestore con el título viejo, el hero seguirá mostrando "KRATOS STORE" en
> producción hasta que se edite desde Panel → Contenido. Lo mismo con `holderName` en
> `settings/payment`. Es un pendiente **de operación, no de código** (ver §12).

> `Category` (`id`, `name`, `slug`) está declarada en `types.ts` pero **no se usa**: las
> categorías se manejan como simples `string[]` dentro de `SiteContent`.

### Estructura resultante en Firestore

```
products/{autoId}        → Product
settings/payment         → PaymentInfo
settings/siteContent     → SiteContent
```

---

## 4. Capa de datos (`src/lib/firebaseUtils.ts`)

Todas las funciones corren en el **cliente** usando el SDK web de Firebase.
Las lecturas atrapan errores y devuelven un valor seguro (`[]` o el default) para que la página
nunca rompa; las escrituras dejan propagar el error para que la UI muestre un toast.

| Función | Qué hace |
|---|---|
| `getProducts(category?)` | Productos con `status == 'published'`, opcionalmente filtrados por categoría. Devuelve `[]` ante error. |
| `getAllProductsAdmin()` | Todos los productos ordenados por `createdAt desc` (para el panel). |
| `createProduct(data)` | `addDoc` con `serverTimestamp()`; devuelve el nuevo ID. |
| `updateProduct(id, data)` | `updateDoc` parcial + `updatedAt`. |
| `deleteProduct(id)` | `deleteDoc`. |
| `getPaymentInfo()` | Lee `settings/payment`; `null` si no existe. |
| `updatePaymentInfo(data)` | `setDoc` (sobrescribe). |
| `getSiteContent()` | Lee `settings/siteContent`; devuelve `defaultSiteContent` si no existe. |
| `updateSiteContent(data)` | `setDoc` con `{ merge: true }`. |

> La consulta con categoría combina `where('status')` + `where('category')`; si Firestore lo
> exige, hay que crear el **índice compuesto** correspondiente. Como el `catch` devuelve `[]`,
> ese error se manifestaría como un catálogo vacío y silencioso.

---

## 5. Flujo del sitio público

`src/app/page.tsx` es un **client component** completo:

1. Al montar, dispara en paralelo `getSiteContent()`, `getProducts()` y `getPaymentInfo()`.
2. Mientras carga muestra un loader de marca a pantalla completa (lockup vertical
   `logo-espartano-white.png` a 190 px con pulso de opacidad + barra animada).
3. Con los datos listos, renderiza:

```
<Navbar />                              fija, se compacta al scrollear >40px
<AnnouncementBar content={...} />       ticker; se oculta si isVisible === false
<main>
  <HeroSection content={...} />         título animado palabra por palabra + CTA
  <ProductCatalog products categories />búsqueda por nombre/descripción + tabs
  <DeliverySection content={...} />     grilla de features editables
  <PaymentSection paymentInfo={...} />  datos de Pago Móvil, click para copiar
</main>
<Footer />                              navegación, contacto, año dinámico
```

Además, el `layout.tsx` raíz inyecta en todas las páginas (incluido el panel) un **botón
flotante de WhatsApp** y la metadata SEO / OpenGraph.

**Detalles de la grilla de productos** (`ProductCatalog.tsx`):
- El precio mostrado se calcula como `price * (1 - discount/100)` cuando hay descuento; el
  `price` original queda tachado. `originalPrice` no interviene en ese cálculo.
- Hover sobre la imagen cambia a la segunda imagen del array (`images[1]`), si existe.
- El botón "Consultar" abre WhatsApp con el nombre del producto ya escrito en el mensaje.
- Sin resultados, se ofrece un CTA de "Consultar disponibilidad".

---

## 6. Panel de administración

### 6.1 Autenticación

`src/app/admin/page.tsx` compara la contraseña ingresada contra
`process.env.NEXT_PUBLIC_ADMIN_PASSWORD` (con un fallback hardcodeado). Si coincide, guarda
`espartano_admin_auth = 'true'` en `sessionStorage` y redirige a `/admin/dashboard`.

`src/app/admin/dashboard/layout.tsx` verifica esa clave en un `useEffect`; si falta,
`router.replace('/admin')`. El botón "Cerrar sesión" limpia la clave.

> 🔒 **Es una barrera de conveniencia, no seguridad real.** Al ser una variable `NEXT_PUBLIC_*`
> la contraseña viaja en el bundle del navegador, y el guard se ejecuta después del render en el
> cliente. La protección efectiva de los datos depende exclusivamente de las **reglas de
> seguridad de Firestore**. Ver §9.

### 6.2 Dashboard (`/admin/dashboard`)

Carga todos los productos y muestra contadores de total / publicados / borradores, más tres
accesos rápidos a las secciones del panel. La sidebar (con versión móvil colapsable) enlaza
Dashboard, Productos, Contenido y Pagos Móvil, y ofrece "Ver tienda".

### 6.3 Productos (`/admin/dashboard/products`) — 691 líneas

El flujo está pensado para **carga masiva**:

1. Se arrastran (o seleccionan) varias imágenes sobre la zona de subida.
2. Se filtran los archivos que no sean imagen.
3. Por **cada** archivo se llama a `startUpload([file])` (`useUploadThing`) y, con la URL
   devuelta (`ufsUrl`), se crea un producto:
   - `name` = nombre del archivo sin extensión y con `-`/`_` convertidos en espacios
   - `price: 0`, `category` = primera categoría configurada, `status: 'draft'`
4. Se actualiza la barra de progreso y al terminar se recarga la lista.
5. El administrador edita cada producto en el modal (nombre, precio, precio original,
   categoría, descuento, descripción, estado, stock) y lo pasa a `published`.

Otras acciones: búsqueda por nombre/categoría, filtro por estado, alternar
`draft ⇄ published` con un clic, y borrado con diálogo de confirmación que **primero elimina
las imágenes de UploadThing** (`deleteImagesByUrl`) y luego el documento de Firestore.

> Las subidas son secuenciales (un `await` por archivo), así que muchas imágenes tardan.
> El texto del progreso dice "Subiendo imágenes a Firebase…" — es un texto heredado: el
> destino real es UploadThing.

### 6.4 Contenido (`/admin/dashboard/content`)

Editor con 4 pestañas sobre un único estado local que se persiste con un botón "Guardar":

| Pestaña | Permite |
|---|---|
| 🏠 Hero | título, subtítulo, imagen de fondo (URL), texto del CTA |
| 📢 Anuncios | agregar/editar/eliminar mensajes del ticker y mostrar u ocultar la barra |
| 🚚 Delivery | título, subtítulo y lista de features (icono emoji, título, descripción) |
| 🏷️ Categorías | agregar, renombrar y eliminar categorías |

Guarda con `updateSiteContent` (`merge: true`), por lo que los cambios impactan la tienda de
inmediato en la siguiente carga.

> Renombrar o borrar una categoría **no** actualiza los productos que la usaban: quedan con un
> `category` huérfano y dejan de aparecer bajo cualquier tab (aunque siguen visibles en "Todos"
> y en la búsqueda).

### 6.5 Pagos (`/admin/dashboard/payments`)

Formulario de banco (lista predefinida de 15 bancos venezolanos), teléfono, cédula/RIF y
titular. Valida que los cuatro campos estén completos antes de guardar en `settings/payment`.

---

## 7. Subida de imágenes (UploadThing)

```
Navegador                          Servidor Next                 UploadThing
   │ useUploadThing('imageUploader')     │                            │
   ├────────────────────────────────────►│  /api/uploadthing (route)  │
   │                                     ├───────────────────────────►│
   │                                     │   middleware → metadata    │
   │◄──── ufsUrl ────────────────────────┤   onUploadComplete         │
   │                                                                  │
   │ createProduct({ images: [ufsUrl] })  ──────► Firestore           │
```

- **`src/app/api/uploadthing/core.ts`** — define el endpoint `imageUploader`:
  `image`, máximo **4 MB** por archivo y **10 archivos** por request. El `middleware` sólo
  devuelve `{ uploadedBy: 'admin' }`; **no valida sesión**, así que cualquiera que descubra la
  ruta puede subir archivos.
- **`route.ts`** — expone `GET`/`POST` vía `createRouteHandler`.
- **`src/lib/uploadthing.ts`** — genera `UploadButton`, `UploadDropzone`, `useUploadThing` y
  `uploadFiles` tipados con `OurFileRouter`. En la práctica sólo se usa `useUploadThing`.
- **`src/app/actions/uploadthing.ts`** — Server Action `deleteImagesByUrl(urls)`: extrae la
  *key* de cada URL partiendo por `/f/` y llama a `utapi.deleteFiles(keys)`. Requiere el token
  de UploadThing en el servidor. Los errores se registran en consola y no interrumpen el borrado
  del producto.

---

## 8. Estilos e identidad visual

### 8.1 Sistema de estilos

- **`src/app/globals.css`** concentra los design tokens en `:root` (paleta blanco/negro con
  12 grises, tipografías `Inter` y `Playfair Display` importadas de Google Fonts, escala de
  espaciado, radios, sombras y transiciones) y las clases reutilizables: `.container`,
  `.btn-primary`, `.btn-secondary`, `.form-input`, `.form-select`, `.toast`, `.skeleton`,
  `.product-card`, `.sidebar`, `.whatsapp-float`, etc.
- Cada componente añade sus estilos específicos con bloques `<style jsx>`.
- No hay Tailwind ni librería de componentes; `page.module.css` quedó vacío.
- La estética es monocroma (negro/blanco) con acentos por emoji.

### 8.2 Assets de marca

El logo es un **casco espartano** con la palabra ESPARTANO debajo. La fuente es
`logoPagina/cc6ff772-d1ad-416e-ba0c-822a172ecea6.jpeg` (810×1080, casco negro sobre fondo
blanco). De ahí se derivaron todos los PNG con fondo transparente:

| Archivo | Dimensiones | Contenido | Dónde se usa |
|---|---|---|---|
| `public/isotipo-espartano.png` | 278×560 | Casco solo, tinta negra | Navbar |
| `public/isotipo-espartano-white.png` | 278×560 | Casco solo, tinta blanca | Footer, login admin, sidebar admin |
| `public/logo-espartano.png` | 611×674 | Lockup completo (casco + palabra), negro | — (disponible) |
| `public/logo-espartano-white.png` | 611×674 | Lockup completo, blanco | Loader de la home |
| `public/og-espartano.png` | 1200×630 | Tarjeta social | `openGraph.images` y `twitter.images` |
| `src/app/favicon.ico` | 16/32/48/64/128/256 | ICO multi-resolución | Pestaña del navegador |
| `src/app/icon.png` | 512×512 | Ícono de app | Convención de archivos de Next |
| `src/app/apple-icon.png` | 180×180 | Ícono iOS (a sangre, sin esquinas) | Convención de archivos de Next |

**Cómo se generaron.** El proyecto no tenía `node_modules` (por lo tanto tampoco `sharp`), así
que los assets se produjeron con PowerShell + `System.Drawing`: recorte por *bounding box*
medido sobre el JPEG (silueta completa `x=99..709, y=134..807`; casco solo `x=266..543,
y=134..693`), escalado bicúbico y conversión de fondo blanco a transparencia mediante
`alpha = 255 − luminancia`. Ese cálculo preserva el antialiasing del original en vez de recortar
duro por umbral. Las variantes blancas recolorean la tinta a blanco usando la misma máscara
alpha, lo que produce el casco "en negativo" (masa blanca con líneas de detalle oscuras), que es
la lectura correcta sobre fondo oscuro. Los scripts no forman parte del repositorio.

### 8.3 Decisiones de diseño

- **Navbar y footer separan isotipo de palabra**: el casco va como `<Image>` y "ESPARTANO" como
  texto HTML con la tipografía serif. El lockup original es vertical (611×674), así que a 42 px
  de alto la palabra sería ilegible. Separándolos se controla cada parte por separado y el
  conjunto sigue siendo responsive (en `≤480px` el casco baja a 34 px y la fuente a 18 px).
- **El loader sí usa el lockup completo** porque ahí hay espacio (190 px de alto).
- **El favicon es el casco blanco sobre cuadro negro redondeado** (radio 22 %), no el casco negro
  original: sobre las barras de pestañas oscuras el original desaparecería. El casco ocupa 0,86
  del alto del cuadro — con 0,66 resultaba ilegible a 16 px. Aun así, a 16 px la lectura es
  justa por lo angosto de la silueta (aspecto ≈0,5); de 32 px en adelante lee bien.
- **`apple-icon.png` va a sangre** (cuadrado negro sin esquinas redondeadas) porque iOS aplica su
  propia máscara y las esquinas transparentes se verían mal.
- **Los íconos se declaran por convención de archivos de Next** (`favicon.ico`, `icon.png`,
  `apple-icon.png` dentro de `src/app/`), **no** con `metadata.icons` — declarar ese campo
  sobrescribiría la convención.
- **Patrón CSS para las imágenes**: cada `<Image>` va envuelto en un `<span class="…">` y se
  estiliza con el selector `.clase :global(img)`, para no depender de que `styled-jsx` propague
  su clase de scope a un componente de React. Todos llevan `height` fijo + `width: auto` (ambas
  dimensiones definidas) para evitar el warning de aspect ratio de `next/image`.
- **Accesibilidad**: `alt=""` en los isotipos decorativos (el nombre ya está como texto al lado),
  `aria-label="Espartano — Inicio"` en el `Link` del navbar, y `alt="Espartano"` en el loader,
  donde la imagen sí es el único contenido. `priority` en navbar, loader y login.
- Los `width`/`height` de cada `<Image>` coinciden exactamente con las dimensiones reales del
  archivo. Los assets se regeneraron a la mitad del tamaño inicial para bajar peso (isotipos de
  ~300 KB a ~85 KB, lockups de ~480 KB a ~135 KB) y los props se sincronizaron.

> `next/image` se usa **sólo** para los assets de marca. Las fotos de producto siguen
> renderizándose con `<img>` (ver §10, punto 4).

---

## 9. Configuración y puesta en marcha

### Variables de entorno (`.env.local`, ignorado por git)

```bash
# Firebase (cliente)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Acceso al panel (queda expuesto en el bundle del cliente)
NEXT_PUBLIC_ADMIN_PASSWORD=

# UploadThing (sólo servidor — lo lee el SDK automáticamente)
UPLOADTHING_TOKEN=
```

### Comandos

```bash
npm install
npm run dev     # http://localhost:3000  (panel en /admin)
npm run build
npm run start
npm run lint
```

### Reglas de Firestore recomendadas

Como el panel escribe con el SDK cliente y sin Firebase Auth, unas reglas abiertas dejan la base
de datos escribible por cualquiera. La ruta correcta es migrar la escritura a Firebase Auth o a
Server Actions con Admin SDK; mientras tanto, como mínimo, mantener las lecturas públicas y las
escrituras cerradas al público general.

---

## 10. Observaciones y deuda técnica

Puntos detectados al revisar el código, en orden aproximado de importancia:

1. **Autenticación del panel sólo en el cliente.** `NEXT_PUBLIC_ADMIN_PASSWORD` es legible en el
   bundle y la contraseña por defecto está hardcodeada en `src/app/admin/page.tsx:28`. El guard
   de `sessionStorage` no impide llamadas directas a Firestore ni a `/api/uploadthing`.
2. **Endpoint de subida sin autorización** (`core.ts`): el `middleware` no valida nada y su
   parámetro `req` queda sin usar.
3. **Toda la data se lee desde el cliente**, así que la home no aprovecha SSR/SSG: hay un loader
   a pantalla completa en cada visita y el catálogo no es indexable por buscadores. Migrar las
   lecturas a Server Components mejoraría SEO y tiempo de primera pintura.
4. **`next/image` sólo se usa para los assets de marca.** Las imágenes de producto siguen con
   `<img>`, pese a que `next.config.ts` define `remotePatterns`. Además esos patrones apuntan a
   `utfs.io` y a Firebase Storage, mientras que las URLs actuales de UploadThing son del tipo
   `https://<app>.ufs.sh/f/<key>` — habría que agregar ese host antes de migrar el catálogo a
   `next/image`.
5. **Número de WhatsApp repetido en 9 lugares** (`layout.tsx`, `Navbar`, `HeroSection`,
   `ProductCatalog` ×2, `DeliverySection`, `PaymentSection`, `Footer` ×2). Conviene centralizarlo
   en una constante o, mejor, en `SiteContent` para hacerlo editable desde el panel.
6. **Comentarios desactualizados**: `firebase.ts` menciona Cloudinary y la barra de progreso de
   productos dice "Firebase"; el proveedor real de imágenes es UploadThing.
7. **`Product.featured` y el tipo `Category` no se usan.**
8. **Los `catch` silenciosos** de `firebaseUtils` ocultan la causa real de un catálogo vacío.
9. **`README.md` sigue siendo el de `create-next-app`.** Sería el lugar natural para un índice
   que apunte a esta documentación.
10. **Sin tests ni CI.**
11. **Los SVG del starter de Next siguen en `public/`** (`file.svg`, `globe.svg`, `next.svg`,
    `vercel.svg`, `window.svg`) sin que nada los use.
12. **El rebranding a ESPARTANO no está verificado con un build.** Ver §12.

---

## 11. Guía rápida para tareas frecuentes

| Quiero… | Dónde |
|---|---|
| Cambiar textos del hero, anuncios, envíos o categorías | Panel → Contenido |
| Cargar productos nuevos | Panel → Productos → arrastrar imágenes → editar cada uno → Publicar |
| Cambiar los datos de Pago Móvil | Panel → Pagos Móvil |
| Cambiar el número de WhatsApp | Buscar `584145851705` en `src/` (9 ocurrencias) |
| Cambiar colores o tipografías | `src/app/globals.css` → bloque `:root` |
| Cambiar título/descripción SEO | `src/app/layout.tsx` → `metadata` |
| Cambiar el logo | Regenerar los PNG de §8.2 con las mismas dimensiones y reemplazarlos; si cambian las dimensiones, sincronizar los props `width`/`height` de cada `<Image>` |
| Cambiar el favicon | Reemplazar `src/app/favicon.ico` (ICO multi-resolución) e `icon.png` / `apple-icon.png`; no declarar `metadata.icons` |
| Cambiar la imagen que se ve al compartir el link | `public/og-espartano.png` (1200×630) |
| Cambiar el nombre de la marca | Textos en los 12 archivos de §12.2 + el hero guardado en Firestore desde Panel → Contenido |
| Agregar una sección a la home | Crear el componente en `src/components/client/` y montarlo en `src/app/page.tsx` |
| Agregar un campo a los productos | `src/lib/types.ts` → modal de `admin/dashboard/products/page.tsx` → `ProductCatalog.tsx` |
| Agregar una página al panel | Nueva carpeta bajo `src/app/admin/dashboard/` + entrada en `navItems` del `layout.tsx` |

---

## 12. Bitácora: rebranding a ESPARTANO (30-08-2026)

Tres sesiones trabajaron en paralelo sobre el mismo árbol de archivos y el resultado se
consolidó en un único commit, `20bac10` — *"feat: rebranding a ESPARTANO, identidad visual y
documentacion tecnica"* (22 archivos, +525 / −66).

### 12.1 Documentación técnica inicial

Se creó `documentacion/DOCUMENTACION.md` (este archivo) tras un estudio del código: arquitectura,
modelo de datos, flujos del sitio público y del panel, subida de imágenes, configuración y una
sección explícita de deuda técnica. **Cero cambios de runtime.**

Se decidió un solo archivo en lugar de varios (el pedido era "un md explicativo") y todo en
español, para coincidir con el idioma del código y sus comentarios. La sección de deuda técnica
se incluyó porque varios de los hallazgos son de seguridad y documentar la arquitectura sin
marcarlos habría sido incompleto.

> Este documento se escribió **antes** del rebranding y quedó desactualizado respecto a él;
> las referencias a la marca vieja se corrigieron al consolidar.

### 12.2 Rebranding textual (12 archivos)

`layout.tsx` · `page.tsx` · `Navbar.tsx` · `Footer.tsx` · `PaymentSection.tsx` ·
`firebaseUtils.ts` · `admin/page.tsx` · `admin/dashboard/layout.tsx` ·
`admin/dashboard/page.tsx` · `admin/dashboard/payments/page.tsx` · `package.json` ·
`package-lock.json`

**Sitio público**
- `layout.tsx` — `title`, `description`, `keywords` y OpenGraph → *"Espartano | Accesorios
  Premium para Caballeros"*. También el mensaje pre-cargado del botón flotante de WhatsApp.
- `Navbar.tsx`, `page.tsx` (loader), `Footer.tsx` — wordmark y copyright (*"© {year} Espartano."*).
- `firebaseUtils.ts` — `defaultSiteContent.hero.title` → `'ESPARTANO'`.
- `PaymentSection.tsx` y `dashboard/payments/page.tsx` — `holderName` por defecto → `'Espartano'`.

**Panel**
- Nombre ESPARTANO en login y sidebar; el ícono cuadrado de marca pasó de la letra "K" a "E"
  (y después, en §12.3, al casco).
- `dashboard/page.tsx` — copy: *"Gestiona todos los aspectos de Espartano desde aquí."*
- **Clave de `sessionStorage` renombrada**: `kratos_admin_auth` → `espartano_admin_auth`,
  cambiada de forma atómica en los dos archivos que la usan.

**Proyecto** — `package.json` / `package-lock.json`: `"name": "kratos-store"` → `"espartano"`.

**Decisiones**
- La marca es **"ESPARTANO" a secas, sin "STORE"**: el usuario pidió ese nombre y agregar "STORE"
  habría sido inventar. Como consecuencia, el wordmark de dos tonos (palabra serif + " STORE" en
  gris claro sans) se quedó sin su segunda mitad, así que se eliminaron las reglas CSS que sólo
  estilizaban ese `<span>`: `.logo-store` (Navbar), `.loader-logo span` (page.tsx) y
  `.footer-logo span` (Footer). Es reversible si se decide volver a "ESPARTANO STORE".
- Renombrar la clave de `sessionStorage` invalida las sesiones de admin abiertas: hay que volver
  a entrar con la contraseña. Único efecto colateral.
- Los reemplazos de texto se hicieron a nivel de bytes (`sed`/`perl`) para no romper los acentos
  de los strings en español.

### 12.3 Identidad visual

Assets generados y puntos de consumo: **ver §8.2 y §8.3**, donde está documentado en detalle
(dimensiones, proceso de generación, decisiones de diseño y accesibilidad).

Archivos creados: los 5 PNG de `public/` más `src/app/icon.png` y `src/app/apple-icon.png`.
Archivos modificados: `favicon.ico` (antes el del starter de Next), `Navbar.tsx`, `Footer.tsx`,
`page.tsx` (loader), `admin/page.tsx` (login), `admin/dashboard/layout.tsx` (sidebar) y
`layout.tsx` (sólo el bloque `openGraph`/`twitter`).

Sobre el solapamiento con §12.2: el logo de origen ya decía "ESPARTANO" mientras el sitio decía
"KRATOS STORE"; al consultarlo, el usuario eligió rebrand completo. Como los textos de marca ya
estaban renombrados, en esta tanda **sólo se agregó la parte gráfica** — el cuadro negro del
login y de la sidebar pasó de mostrar la letra "E" a mostrar el casco.

**Deliberadamente fuera de alcance**: las tarjetas de Pago Móvil (`payment-card-logo` /
`preview-card-logo`) siguen con el emoji 💳 — son el encabezado del método de pago, no la marca.

### 12.4 Pendientes que dejó esta tanda

1. **Nadie corrió el build.** El proyecto no tiene `node_modules` instalado; no se ejecutó
   `typecheck`, `lint` ni `build` sobre ninguno de estos cambios. La verificación fue manual
   (revisión de cada región editada y `grep -i kratos` sobre `src/` + `package*.json`, que no
   devuelve nada). **Antes de dar esto por bueno hay que correr `npm install && npm run build`
   y confirmar visualmente.**
2. **Riesgo con Next 16.** Por lo mismo, no se pudo leer `node_modules/next/dist/docs/` como
   exige `AGENTS.md`. El código de `next/image` y la convención de archivos de íconos se
   escribieron con APIs conservadoras, pero **no están verificados contra la documentación de
   esa versión**. Es el punto de mayor riesgo del rebranding.
3. **Contenido guardado en Firestore.** Si `settings/siteContent` y `settings/payment` ya
   existen, el hero y el titular del Pago Móvil siguen con los valores viejos hasta que se
   editen desde el panel. Tarea de operación, no de código.
4. **Favicon a 16 px**: legible pero justo, por lo angosto del casco. La alternativa sería un
   isotipo simplificado dibujado a mano.
5. **Sesiones de admin abiertas**: quedan invalidadas por el cambio de clave de `sessionStorage`.
