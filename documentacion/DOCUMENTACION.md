# Kratos Store — Documentación técnica

> Catálogo web de accesorios masculinos con panel de administración propio.
> El cierre de venta no ocurre en el sitio: cada producto enlaza a WhatsApp.

---

## 1. Resumen del proyecto

**Kratos Store** (`kratos-store`) es una tienda-vitrina de una sola página pública más un panel
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
├── logoPagina/                  Logo original (sin trackear en git)
├── public/                      SVGs por defecto de create-next-app
├── documentacion/               ← esta documentación
└── src/
    ├── app/
    │   ├── layout.tsx           Root layout: metadata SEO + botón flotante de WhatsApp
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
o Firestore falla: define la marca "KRATOS STORE", 4 mensajes de anuncio, 4 features de envío y
7 categorías (Relojes, Billeteras, Cinturones, Lentes, Cadenas, Pulseras, Anillos).

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
2. Mientras carga muestra un loader de marca a pantalla completa ("KRATOS STORE" + barra animada).
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
`kratos_admin_auth = 'true'` en `sessionStorage` y redirige a `/admin/dashboard`.

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

## 8. Estilos

- **`src/app/globals.css`** concentra los design tokens en `:root` (paleta blanco/negro con
  12 grises, tipografías `Inter` y `Playfair Display` importadas de Google Fonts, escala de
  espaciado, radios, sombras y transiciones) y las clases reutilizables: `.container`,
  `.btn-primary`, `.btn-secondary`, `.form-input`, `.form-select`, `.toast`, `.skeleton`,
  `.product-card`, `.sidebar`, `.whatsapp-float`, etc.
- Cada componente añade sus estilos específicos con bloques `<style jsx>`.
- No hay Tailwind ni librería de componentes; `page.module.css` quedó vacío.
- La estética es monocroma (negro/blanco) con acentos por emoji.

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
4. **`next/image` no se usa en ninguna parte** (sólo `<img>`), pese a que `next.config.ts` define
   `remotePatterns`. Además esos patrones apuntan a `utfs.io` y a Firebase Storage, mientras que
   las URLs actuales de UploadThing son del tipo `https://<app>.ufs.sh/f/<key>` — habría que
   agregar ese host antes de migrar a `next/image`.
5. **Número de WhatsApp repetido en 9 lugares** (`layout.tsx`, `Navbar`, `HeroSection`,
   `ProductCatalog` ×2, `DeliverySection`, `PaymentSection`, `Footer` ×2). Conviene centralizarlo
   en una constante o, mejor, en `SiteContent` para hacerlo editable desde el panel.
6. **Comentarios desactualizados**: `firebase.ts` menciona Cloudinary y la barra de progreso de
   productos dice "Firebase"; el proveedor real de imágenes es UploadThing.
7. **`Product.featured` y el tipo `Category` no se usan.**
8. **Los `catch` silenciosos** de `firebaseUtils` ocultan la causa real de un catálogo vacío.
9. **`README.md` sigue siendo el de `create-next-app`** y `logoPagina/` no está trackeado en git.
10. **Sin tests ni CI.**

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
| Agregar una sección a la home | Crear el componente en `src/components/client/` y montarlo en `src/app/page.tsx` |
| Agregar un campo a los productos | `src/lib/types.ts` → modal de `admin/dashboard/products/page.tsx` → `ProductCatalog.tsx` |
| Agregar una página al panel | Nueva carpeta bajo `src/app/admin/dashboard/` + entrada en `navItems` del `layout.tsx` |
