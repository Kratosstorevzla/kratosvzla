# Espartano Store VZLA — Documentación técnica

> Catálogo web de accesorios masculinos con panel de administración propio.
> El cierre de venta no ocurre en el sitio: cada producto enlaza a WhatsApp.

---

## 1. Resumen del proyecto

**Espartano Store VZLA** (`espartano`) es una tienda-vitrina de una sola página pública más un panel
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

> 🏛️ **Nota de marca.** El proyecto nació como *Kratos Store*, se renombró a *ESPARTANO* y
> finalmente quedó como **ESPARTANO STORE VZLA** (ver §12). Dónde aparece cada forma:
>
> | Superficie | Nombre actual | Fuente |
> |---|---|---|
> | Título del hero | ESPARTANO STORE VZLA | **`BRAND_NAME`** (`src/lib/brand.ts`) |
> | Metadata SEO / OpenGraph / Twitter | Espartano Store VZLA | Literal en `layout.tsx` |
> | Navbar y footer | Lockup de dos líneas: "ESPARTANO" + bajada "STORE VZLA" | Literales en cada componente |
> | Panel de administración (login, sidebar, copy) | ESPARTANO *(a secas — ver §12.5)* | Literales |
> | `holderName` por defecto del Pago Móvil | Espartano | Literal |
> | `package.json` → `name` | `espartano` | — |
> | Repositorio y carpeta del proyecto | `kratosvzla` *(sin cambiar, por el remoto de git)* | — |
>
> **`src/lib/brand.ts` es la fuente única de verdad** para el hero, pero todavía no para todo:
> el nombre sigue existiendo como literal en otros 3 lugares (§10, punto 13).

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
        ├── brand.ts             BRAND_NAME: nombre de la marca, fijo en código
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
o Firestore falla: define la marca "ESPARTANO STORE VZLA", 4 mensajes de anuncio, 4 features de
envío y 7 categorías (Relojes, Billeteras, Cinturones, Lentes, Cadenas, Pulseras, Anillos).

> ⚠️ **Cambiar un default NO cambia lo que se ve en producción.** `getSiteContent()`
> (`firebaseUtils.ts:122-133`) devuelve el documento guardado tal cual y sólo cae a
> `defaultSiteContent` **si el documento no existe**. Así que editar `defaultSiteContent` en el
> código no tiene efecto sobre una instalación que ya guardó contenido: el valor viejo sigue
> mostrándose hasta que alguien lo edite desde el panel. Lo mismo aplica a `holderName` en
> `settings/payment`.
>
> Esto causó un falso "bug" durante el rebranding (§12.5). **Si cambiás un default, el cambio de
> código es sólo la mitad del trabajo** — la otra mitad es el paso de operación descrito en §9.

> 🔒 **`hero.title` es la excepción: ya no se renderiza.** Tras §12.6, el `<h1>` del inicio lee
> la constante `BRAND_NAME` de `src/lib/brand.ts`, no Firestore. El campo sigue existiendo en el
> tipo y en el documento guardado, pero **ningún componente lo muestra** y el editor de contenido
> lo tiene deshabilitado. Es el único campo de `SiteContent` con este tratamiento.

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
  <HeroSection content={...} />         BRAND_NAME animado palabra por palabra + CTA
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
| 🏠 Hero | subtítulo, imagen de fondo (URL), texto del CTA. **El título está deshabilitado**: muestra `BRAND_NAME` en un input `disabled readOnly` con una nota explicando que el nombre está fijo en el código (§12.6) |
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

- **Navbar y footer separan isotipo de texto**: el casco va como `<Image>` y el nombre como
  texto HTML. El lockup original es vertical (611×674), así que a 42 px de alto la palabra sería
  ilegible. Separándolos se controla cada parte por separado y el conjunto sigue siendo
  responsive (en `≤480px` el casco baja a 34 px y la fuente a 18 px).
- **El texto es un lockup de dos líneas apiladas**: "ESPARTANO" en serif y debajo la bajada
  "STORE VZLA" en sans, gris y con `letter-spacing` amplio. Se apilan en columna
  (`.logo-text` / `.footer-logo-text`, flex column) y no en línea porque el isotipo ya consume
  ancho horizontal y "ESPARTANO STORE VZLA" en una sola línea rompía el navbar en móvil.

  | | Navbar (`.logo-tag`) | Footer (`.footer-logo-tag`) |
  |---|---|---|
  | Tamaño | 10 px (9 px en `≤480px`) | 11 px |
  | `letter-spacing` | 0.28em (0.2em en `≤480px`) | 0.3em |
  | Color | `--gray-600` (sobre fondo claro) | `--gray-500` (sobre `--gray-900`) |
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

### Paso de operación tras cambiar los defaults de contenido

Si tocaste `defaultSiteContent` o el `holderName` por defecto en el código, hay que replicar el
cambio en los datos guardados; si no, el sitio en producción sigue mostrando lo viejo (§3):

1. Entrar a `/admin` con la contraseña.
2. **Contenido** → revisar subtítulo del hero, anuncios, delivery y categorías → *Guardar*.
3. **Pagos Móvil** → corregir el titular → *Guardar*.
4. Recargar la home y confirmar.

> **El nombre de la marca ya no requiere este paso.** Desde §12.6 el título del hero se lee de
> `BRAND_NAME` (`src/lib/brand.ts`), así que cambiarlo es tocar una línea de código y desplegar.
> El resto de los campos de contenido sí siguen la regla de arriba.

> Este paso no se puede automatizar desde el repo: requiere las credenciales
> `NEXT_PUBLIC_FIREBASE_*`, que viven en `.env.local` y no están versionadas.

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
12. **El rebranding a ESPARTANO STORE VZLA no está verificado con un build.** Ver §12.
13. **El nombre de la marca vive en dos regímenes.** `BRAND_NAME` (`src/lib/brand.ts`) manda en el
    hero, pero el nombre sigue como literal en `layout.tsx` (metadata), `Navbar.tsx` y
    `Footer.tsx`. Es deliberado — esos tres parten la marca en dos trozos con estilos distintos
    ("ESPARTANO" serif grande + "STORE VZLA" sans pequeño), así que usar la constante obligaría a
    trocear el string. El costo es que un cambio de nombre requiere tocar 4 lugares, no 1.
14. **`settings/siteContent.hero.title` conserva el nombre viejo en Firestore.** Ya no se muestra
    en ningún lado, pero el dato sigue ahí y reaparecería si alguien revirtiera §12.6.

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
| Cambiar el nombre de la marca | `BRAND_NAME` en `src/lib/brand.ts` (cubre el hero) **más** los literales de `layout.tsx`, `Navbar.tsx` y `Footer.tsx` — ver §10, punto 13 |
| Agregar una sección a la home | Crear el componente en `src/components/client/` y montarlo en `src/app/page.tsx` |
| Agregar un campo a los productos | `src/lib/types.ts` → modal de `admin/dashboard/products/page.tsx` → `ProductCatalog.tsx` |
| Agregar una página al panel | Nueva carpeta bajo `src/app/admin/dashboard/` + entrada en `navItems` del `layout.tsx` |

---

## 12. Bitácora: rebranding a ESPARTANO STORE VZLA (30-08-2026)

Tres sesiones trabajaron en paralelo sobre el mismo árbol de archivos. El resultado se consolidó
en esta secuencia de commits:

| Commit | Cubre | Alcance |
|---|---|---|
| `20bac10` | §12.1 – §12.3 | 22 archivos (+525 / −66) |
| `4b84098` | Puesta al día de esta documentación | 1 archivo (+186 / −14) |
| `077860a` | §12.5 | 4 archivos + esta documentación |
| *(siguiente)* | §12.6 | 1 archivo nuevo + 4 modificados + esta documentación |

Al trabajar en paralelo sobre los mismos archivos hubo dos solapamientos, ambos resueltos y
documentados abajo: el rebranding textual (§12.2) y el rediseño gráfico (§12.3) tocaron
`Navbar.tsx`, `Footer.tsx` y `page.tsx` a la vez, y la segunda iteración (§12.5) chocó con el
CSS que había dejado el rediseño.

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
- La marca se tomó como **"ESPARTANO" a secas, sin "STORE"**: el usuario pidió ese nombre y
  agregar "STORE" habría sido inventar. Como consecuencia, el wordmark de dos tonos (palabra
  serif + " STORE" en gris claro sans) se quedó sin su segunda mitad, así que se eliminaron las
  reglas CSS que sólo estilizaban ese `<span>`: `.logo-store` (Navbar), `.loader-logo span`
  (page.tsx) y `.footer-logo span` (Footer).

  > ↩️ **Esta decisión se revirtió después**: el nombre completo sí lleva "STORE VZLA".
  > Ver §12.5.
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

### 12.4 Pendientes (§12.1 – §12.3)

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

### 12.5 Segunda iteración: "ESPARTANO STORE VZLA"

**Disparador.** El usuario reportó que el inicio seguía mostrando "KRATOS STORE VZLA" y pidió
que dijera "ESPARTANO STORE VZLA". El reporte reveló dos cosas distintas:

1. El nombre completo de la marca **sí lleva "STORE VZLA"** — la lectura de §12.2 ("ESPARTANO" a
   secas) era incorrecta y había que corregirla en el código.
2. Lo que el usuario estaba viendo **no venía del código en absoluto** (ver más abajo).

**Archivos modificados (4).** `layout.tsx` · `Navbar.tsx` · `Footer.tsx` · `firebaseUtils.ts`

- `layout.tsx` — `title`, `description`, `keywords`, `openGraph.title`, `openGraph.siteName`,
  `twitter.title` y el mensaje pre-cargado del enlace `wa.me` → "Espartano Store VZLA".
- `Navbar.tsx` y `Footer.tsx` — el wordmark pasa de una línea a un lockup de dos líneas
  apiladas, agregando la bajada "STORE VZLA". Nuevas clases `.logo-text` / `.logo-tag` y
  `.footer-logo-text` / `.footer-logo-tag`, con ajuste responsive en `≤480px`.
  Detalles tipográficos en **§8.3**.
- `firebaseUtils.ts:95` — `defaultSiteContent.hero.title` → `'ESPARTANO STORE VZLA'`.
- El **loader** de `page.tsx` quedó como imagen pura (`logo-espartano-white.png`): el nombre ya
  está en el lockup gráfico, un texto encima sobraría. Su diff quedó intencionalmente vacío.

**El panel de administración no se tocó**: login, sidebar y copy del dashboard siguen diciendo
"ESPARTANO" a secas, igual que el `holderName` por defecto del Pago Móvil y el `name` de
`package.json`. Es deliberado — el pedido era sobre el inicio, y el sidebar y el login son
contenedores estrechos donde la bajada no entra cómoda. Si se quiere uniformidad total es un
cambio de una línea en cada archivo.

**⚠️ El "bug" reportado no se arregla desde el código.** El "KRATOS STORE VZLA" que veía el
usuario es un dato guardado en `settings/siteContent`, y `getSiteContent()` devuelve el
documento guardado tal cual: el default sólo entra si el documento **no existe**. La corrección
efectiva es manual y está documentada como paso de operación en **§9**. Este cambio de código
deja el default correcto para instalaciones nuevas, nada más.

**Nota de proceso.** El primer intento de esta tanda chocó con el rediseño gráfico de §12.3: se
insertaron reglas `.loader-logo span` y `.footer-logo span` cuando esos contenedores ya eran
imágenes con `<span>` adentro — `.footer-logo span` en particular habría roto el estilo del
wordmark. Se detectó y revirtió antes de commitear; no queda deuda técnica de eso.

### 12.6 El nombre de la marca, fijo en el código

**Disparador.** §12.5 dejó como pendiente que el hero seguía mostrando el nombre viejo porque
venía de Firestore, y que había que corregirlo a mano desde `/admin`. El usuario decidió no
depender de ese paso manual: *"hardcodea el nombre en el código donde sale KRATOS STORE VZLA"*.
Esto **cierra ese pendiente** — ya no hace falta ninguna acción post-deploy para el nombre.

**Archivo nuevo: `src/lib/brand.ts`**

```ts
export const BRAND_NAME = 'ESPARTANO STORE VZLA';
```

Sin imports, así que no puede generar ciclos de dependencia. Es la fuente única de verdad para
el hero: cambiar el nombre ahí es una sola línea.

**Modificados (4)**

- `HeroSection.tsx:31` — **el arreglo de fondo.** El `<h1>` pasa de
  `hero.title.split(' ').map(…)` a `BRAND_NAME.split(' ').map(…)`. El título del inicio ya no
  depende de la base de datos. Se mantuvo el `split(' ')` porque cada palabra se renderiza como
  un `<span className="hero-word">` con `animationDelay` escalonado; con tres palabras la
  animación de entrada sigue funcionando igual.
  El resto del hero (`subtitle`, `backgroundImage`, `ctaText`) **se sigue leyendo de Firestore**;
  sólo el nombre quedó fijo.
- `firebaseUtils.ts:95` — `defaultSiteContent.hero.title` pasa del literal a `BRAND_NAME`, para
  no tener dos definiciones del nombre que puedan divergir.
- `admin/dashboard/content/page.tsx:178-181` — al fijar el hero, el campo "Título principal" del
  editor quedaba muerto: el administrador escribía, guardaba y no pasaba nada en la web. Se dejó
  `disabled readOnly` mostrando `BRAND_NAME`, con un `<p className="form-hint">` que explica
  *"El nombre de la marca está fijo en el código y no se puede editar desde aquí."*
  **Se prefirió eso a borrar el campo** para que quede visible *por qué* no se puede editar, en
  vez de que el nombre desaparezca del panel sin explicación. `updateHero` sigue en uso para
  `subtitle`, `ctaText` y `backgroundImage`, así que no quedó código muerto.
- `globals.css` — dos clases genéricas nuevas que no existían y hacían falta para lo anterior,
  ubicadas después de `.form-input:focus`: `.form-input:disabled` (fondo `--gray-100`, texto
  `--gray-600`, `cursor: not-allowed`) y `.form-hint` (12 px, `--gray-500`). Son reutilizables en
  el resto de los formularios del panel.

**Qué NO se hizo, a propósito.** `Navbar`, `Footer` y el `<title>` de `layout.tsx` no consumen
`BRAND_NAME`: cada uno parte la marca en dos trozos con estilos distintos, así que usar la
constante obligaría a trocear el string. Queda anotado como deuda menor en §10, punto 13.

**Dato de datos.** El documento `settings/siteContent` en Firestore sigue teniendo el nombre
viejo guardado en `hero.title`. Ya no se muestra en ningún lado, pero el dato persiste y
reaparecería si alguien revirtiera este cambio. No se limpió (haría falta acceso a Firestore) ni
hace falta.
