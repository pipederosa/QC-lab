# LabQC — Next.js + TypeScript

Sistema de control de calidad farmacéutico.
Módulos: Estabilidades · SCRUM · Usuarios (Admin)

Stack: **Next.js 14** · **TypeScript** · **React Query** · **Zustand** · **Tailwind CSS**

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          ← Root layout con QueryClientProvider
│   ├── page.tsx            ← Entry point (client-side)
│   └── globals.css         ← Tailwind + design tokens
├── types/
│   └── index.ts            ← Todos los tipos TypeScript
├── lib/
│   ├── roles.ts            ← Configuración de roles y permisos
│   ├── data.ts             ← Datos de ejemplo + funciones fetch (reemplazar con API real)
│   └── utils.ts            ← Utilidades: fechas, sort, CSV, XLSX
├── store/
│   └── appStore.ts         ← Zustand: UI state, datos en memoria, acciones
├── hooks/
│   └── useQueries.ts       ← React Query hooks (listos para API real)
└── components/
    ├── layout/
    │   └── Topbar.tsx      ← Module switcher + nav + user switcher
    ├── PageRouter.tsx       ← Router client-side
    ├── ui/
    │   └── index.tsx       ← Badge, Button, KpiCard, MultiFilter, DetailField, etc.
    ├── estabilidades/
    │   ├── EstDashboard.tsx
    │   ├── EstResults.tsx
    │   ├── EstDetail.tsx
    │   └── EstForm.tsx
    ├── scrum/
    │   ├── ScrumDashboard.tsx
    │   ├── ScrumResults.tsx
    │   ├── ScrumDetail.tsx
    │   └── ScrumForm.tsx
    ├── shared/
    │   └── ActivityLog.tsx
    └── users/
        └── UsersPage.tsx
```

---

## Instalación y desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Servidor de desarrollo
npm run dev
# → http://localhost:3000

# 3. Verificar tipos
npm run type-check

# 4. Lint
npm run lint
```

---

## Build para GitHub Pages

```bash
# 1. Build (genera la carpeta 'out/')
npm run build

# La carpeta 'out/' contiene el sitio estático listo para subir.
```

### Paso a paso en GitHub Pages

1. Crear repositorio en github.com (público para plan gratis)

2. Si el repositorio se llama algo distinto a tu dominio propio,
   descomentar en `next.config.js`:
   ```js
   basePath: '/nombre-del-repo',
   assetPrefix: '/nombre-del-repo/',
   ```
   Luego hacer el build.

3. Subir el contenido de la carpeta `out/` al repositorio:
   ```bash
   # Opción A: subir 'out/' como rama gh-pages
   cd out
   git init
   git add .
   git commit -m "Deploy"
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push --force origin main:gh-pages

   # Opción B: subir todo el repo y usar GitHub Pages desde /out
   # (configurar en Settings → Pages → Branch: main, folder: /out)
   ```

4. En Settings → Pages → Source: Deploy from branch → gh-pages → / (root)

5. URL: `https://TU_USUARIO.github.io/nombre-del-repo/`

### GitHub Actions (deploy automático)

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

Con esto, cada `git push` a `main` despliega automáticamente.

---

## Conectar con Azure AD

### 1. Instalar dependencias

```bash
npm install next-auth @auth/azure-ad-provider
```

### 2. Variables de entorno

Crear `.env.local`:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-aleatorio-seguro

AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=tu-client-secret
AZURE_AD_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Configurar NextAuth

Crear `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { ROLES } from '@/lib/roles'
import type { RoleKey } from '@/types'

// Mapeo de grupos de Azure AD a roles de la app
const AZURE_GROUP_ROLE_MAP: Record<string, RoleKey> = {
  'xxxxxxxx-grupo-admin':      'admin',
  'xxxxxxxx-grupo-supervisor': 'supervisor',
  'xxxxxxxx-grupo-analista':   'analyst',
  'xxxxxxxx-grupo-viewer':     'viewer',
}

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId:     process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId:     process.env.AZURE_AD_TENANT_ID!,
      // Solicitar grupos del usuario
      authorization: {
        params: { scope: 'openid profile email offline_access Group.Read.All' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Obtener grupos del usuario desde Microsoft Graph
        const graphRes = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
          headers: { Authorization: `Bearer ${account.access_token}` },
        })
        const graphData = await graphRes.json()
        const groupIds: string[] = graphData.value?.map((g: { id: string }) => g.id) ?? []

        // Determinar rol según grupos
        let assignedRole: RoleKey = 'viewer' // default
        for (const [groupId, role] of Object.entries(AZURE_GROUP_ROLE_MAP)) {
          if (groupIds.includes(groupId)) {
            assignedRole = role
            break
          }
        }

        token.role = assignedRole
        token.initials = (profile.name ?? 'U').split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase()
      }
      return token
    },
    async session({ session, token }) {
      session.user.role    = token.role as RoleKey
      session.user.initials = token.initials as string
      return session
    },
  },
  pages: {
    signIn: '/login', // página de login personalizada (opcional)
  },
})

export { handler as GET, handler as POST }
```

### 4. Extender tipos de NextAuth

Crear `src/types/next-auth.d.ts`:

```typescript
import type { RoleKey } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role: RoleKey
      initials: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: RoleKey
    initials: string
  }
}
```

### 5. Reemplazar el user switcher en Topbar

```typescript
// En src/components/layout/Topbar.tsx
import { useSession, signIn, signOut } from 'next-auth/react'

// En vez del demo switcher:
const { data: session, status } = useSession()

if (status === 'unauthenticated') {
  signIn('azure-ad')
  return null
}

// El currentUser del store se inicializa desde session:
const role = session?.user.role ?? 'viewer'
```

### 6. Proteger páginas

Envolver el layout con `SessionProvider`:

```typescript
// src/app/layout.tsx
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

---

## Migrar de datos locales a API real

Cuando tengas el backend (FastAPI / NestJS / Azure Functions):

### 1. Cambiar las funciones fetch en `lib/data.ts`

```typescript
// Antes (datos locales):
export async function fetchStudies(): Promise<Study[]> {
  return [...INITIAL_STUDIES]
}

// Después (API real):
export async function fetchStudies(): Promise<Study[]> {
  const res = await fetch('/api/studies', {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  if (!res.ok) throw new Error('Error fetching studies')
  return res.json()
}
```

### 2. Convertir las mutaciones del store a React Query mutations

```typescript
// src/hooks/useStudyMutations.ts
export function useUpdateStudy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: unknown }) =>
      fetch(`/api/studies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studies'] }),
    onError: (err) => console.error('Update failed:', err),
  })
}
```

### 3. En los componentes, reemplazar el store mutation

```typescript
// Antes:
const { updateStudy } = useAppStore()
// onSave: (key, val) => updateStudy(studyId, key, val)

// Después:
const mutation = useUpdateStudy()
// onSave: (key, val) => mutation.mutate({ id: studyId, field: key, value: val })
```

Todo lo demás (UI, tipos, roles, filtros, sort) queda igual.

---

## Roles y acceso

| Rol        | Dashboard | Resultados | Detalle | Nuevo | Actividad | Usuarios |
|------------|:---------:|:----------:|:-------:|:-----:|:---------:|:--------:|
| Viewer     | ✓         | ✓          | ✓ (RO)  | —     | —         | —        |
| Analista   | ✓         | ✓          | ✓ (Ed.) | ✓     | —         | —        |
| Supervisor | ✓         | ✓          | ✓ (Ed.) | ✓     | ✓         | —        |
| Admin      | ✓         | ✓          | ✓ (Ed.) | ✓     | ✓         | ✓        |

RO = Solo lectura · Ed. = Edición habilitada
