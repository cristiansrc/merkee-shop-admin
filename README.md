# merkee-shop-admin

Panel de administración (**admin**) del ecosistema **merkee.shop** — supermercado
digital colombiano. Es una **React + TypeScript SPA** construida con **Refine**
y **Redux Toolkit**, para la gestión del catálogo, media, stock y la lectura de
órdenes, con **RBAC** estricto.

> Parte del workspace `merkee-workspace`. Consume el contrato
> `docs/api/openapi.yaml` vía un cliente tipado. **El admin no compra.**

## Objetivo y alcance

Superficie administrativa solo para el rol `admin`:

- **Login y guards** de ruta (solo admin autenticado).
- **Provisión y activación de admin**: `POST /v1/admin/users` (solo admin con
  contraseña ya cambiada) y activación por token opaco de un uso.
- **Categorías, productos, banners, media**: altas, edición y (soft delete en
  productos).
- **Stock**: ajuste manual auditado e idempotente
  (`POST /admin/products/{id}/stock-adjustments`) con `If-Match` (optimistic
  locking) e `Idempotency-Key`.
- **Órdenes**: **solo lectura** (listado y detalle).
- **Perfil / cambio de contraseña** (`PATCH /me`, `POST /auth/password-change`).

**No es un comprador:** el admin recibe `403` en carrito, checkout y órdenes
propias; no se crea ni conserva un carrito de compra para su sesión.

## Stack

- **React 19 + TypeScript**, **Vite**.
- **Refine** (`@refinedev/core`, `@refinedev/mui`, `@refinedev/react-router-v6`,
  `@refinedev/simple-rest`) para el andamiaje de recursos CRUD y routing.
- **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) para estado de sesión/
  UI.
- **MUI** (`@mui/material`, `@mui/icons-material`, emotion) para componentes.
- **Axios** para el cliente HTTP; **React Router** para navegación.
- **es-CO / COP**: interfaz en español colombiano, precios en pesos enteros.
- **Responsive / accesibilidad**: layout con sidebar adaptable; estados
  loading/error/empty manejados.

## Estructura relevante (disco)

```
src/
├── api/
│   ├── client.ts          # Cliente HTTP tipado (Axios)
│   ├── mocks/             # Datos mock para desarrollo offline
│   └── client.test.ts
├── components/            # Guard de autenticación, layout, UI
├── features/              # auth, categories, products, banners, stock, orders
├── layout/                # DashboardLayout
├── pages/                 # login, dashboard, categories, products, banners,
│                       # stock, orders, admin-activation, password-change
├── store/                 # Redux store / slices
└── types/                 # Tipos del contrato
```

## Mocks vs API real

| Variable | Descripción | Valor en `.env.example` |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del API. | `https://api.merkee.shop/vite` *(ver nota en Pendientes)* |
| `VITE_USE_MOCKS` | `true` usa mocks; `false` usa la API real. | `true` |

Por defecto el admin corre con **mocks** (`VITE_USE_MOCKS=true`). Para conectar
la API real: `VITE_USE_MOCKS=false` y ajustar `VITE_API_BASE_URL`.

**Credenciales de prueba (mock):** `admin@merkee.shop` / cualquier contraseña.

## Cómo ejecutar localmente

Requisitos: Node.js, `npm`.

```bash
npm install
cp .env.example .env      # ajustar VITE_API_BASE_URL / VITE_USE_MOCKS
npm run dev               # servidor de desarrollo Vite
npm run build             # tsc -b && vite build
npm run preview           # previsualizar build de producción
```

## Tests, build y lint

```bash
npm run dev               # desarrollo
npm run build             # build de producción
npm run lint              # oxlint
npm test                  # vitest run (unitarias)
npm run test:coverage     # vitest run --coverage
npm run test:watch        # vitest en modo watch
```

- **Pruebas:** hay pruebas unitarias presentes (Vitest), incluyendo
  `api/client.test.ts` y el directorio `src/test/`. La **cantidad exacta y la
  cobertura medida no están registradas en los artefactos revisados**; no se
  afirma un porcentaje concreto.
- **Pendientes:** ampliar cobertura de features (categories/products/stock/
  orders) y del flujo de provisión/activación; conectar la API real de forma
  estable. Los módulos administrativos del API (catálogo, stock, órdenes) **ya
  tienen implementación local**; el panel funciona contra mocks por defecto
  (`VITE_USE_MOCKS=true`) y requiere la API real conectada para el flujo
  completo.

## Estado de AWS (revisado 2026-08-18)

El admin se sirve como SPA estática hospedada en **S3 privado + CloudFront/OAC**
(ADR-006), dominio/origen distinto al storefront. **AWS configurado** en cuenta de
aprendizaje, región `us-east-1`, un único ambiente: bucket `merkee-frontend-admin`
con distribución CloudFront `E119IKP00L5RU` → `admin.merkee.shop` desplegados. DNS
gestionado en Spaceship; `api.merkee.shop` y `admin.merkee.shop` existen;
`swagger.merkee.shop` pendiente de distribución/origen. No se afirma despliegue
productivo terminado; el estado del despliegue es **en despliegue / pendiente de
verificación**. No se solicitan secretos por chat.

## Notas de seguridad

- RBAC: el rol `admin` es exclusivo; el panel nunca inicia un carrito ni
  checkout.
- Tokens de acceso solo en memoria; refresh/cart token en cookie `HttpOnly`
  del servidor. No se persiste nada sensible en `localStorage`/`sessionStorage`.
- Ajustes de stock auditados e idempotentes; edición con `If-Match`
  (optimistic locking) e `Idempotency-Key`.

## Pendientes de decisión

- **`.env.example` apunta a `https://api.merkee.shop/vite`**: parece un typo de
  `/v1` (el prefijo canónico del server OpenAPI es `/v1`). Confirmar y corregir
  antes de usarlo contra la API real.
- **Módulos del API dependientes:** las operaciones administrativas de
  catálogo/stock/órdenes del API ya tienen implementación local; el panel
  funciona contra mocks por defecto (`VITE_USE_MOCKS=true`) y requiere la API
  real conectada para el flujo completo. Los servicios externos de media (S3) y
  email del API no están configurados (modo fake/dev).
- **Cobertura:** definir y registrar un gate de cobertura explícito para el
  proyecto. **La cobertura completa independiente del admin sigue pendiente de
  medición final**; no se afirma un porcentaje concreto.
