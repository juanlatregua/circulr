# CIRQLR — CLI Build Prompt
## Prompt completo para Claude Code / CLI

---

```
Construye CIRQLR, una plataforma B2B SaaS de economía circular con dos zonas diferenciadas: cliente (PYME) y consultor (Isabelle / Miguel). El objetivo del producto es convertir el cumplimiento normativo de economía circular en un servicio digitalizado, automatizado y monetizable sin depender de subvenciones.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 1. CONTEXTO DE NEGOCIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Producto: CIRQLR
Tagline: Close the loop. Open the revenue.
Dominio target: cirqlr.es / cirqlr.io
Identidad visual:
  - Paleta: #0A0A0A (black), #1C1C1C (smoke), #C8F060 (lime), #F5F5F0 (off-white)
  - Display font: Syne (800, 700)
  - Body font: DM Sans (300, 400, 500)
  - Mono font: DM Mono (400, 500)
  - Tono: directo, tech europeo, sin jerga verde

Roles de usuario:
  - CLIENT: PYME que necesita cumplir normativa CE o responder cuestionarios CSRD
  - CONSULTANT: Isabelle o Miguel — expertos que gestionan y entregan proyectos
  - ADMIN: acceso total (tú)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 2. STACK TÉCNICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework:     Next.js 14 (App Router) + TypeScript
Styling:       Tailwind CSS + shadcn/ui (tema oscuro personalizado)
Auth:          Supabase Auth (email/password + magic link)
Database:      Supabase PostgreSQL con RLS (Row Level Security)
Storage:       Supabase Storage (documentos, PDFs)
AI:            Anthropic Claude API (claude-sonnet-4-20250514)
Payments:      Stripe (one-time + subscriptions)
Email:         Resend (transaccional)
PDF:           react-pdf/renderer (generación de informes)
Deploy:        Vercel
Analytics:     PostHog (GDPR compliant)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 3. BASE DE DATOS — SCHEMA COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- USERS (extends Supabase auth.users)
profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users,
  role            enum('client','consultant','admin') NOT NULL,
  full_name       text,
  company_name    text,
  sector          text,
  company_size    text, -- micro/small/medium/large
  phone           text,
  onboarded       boolean DEFAULT false,
  created_at      timestamptz DEFAULT now()
)

-- PROJECTS
projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid REFERENCES profiles(id),
  consultant_id   uuid REFERENCES profiles(id),
  type            enum('csrd_response','ce_diagnosis','implementation','training'),
  status          enum('draft','pending_payment','active','in_review','delivered','closed'),
  title           text NOT NULL,
  description     text,
  urgency         enum('standard','urgent','critical') DEFAULT 'standard',
  price_eur       integer, -- en céntimos
  stripe_payment_intent text,
  deadline        date,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)

-- ONBOARDING INTAKE (formulario inicial del cliente)
intakes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id),
  client_id       uuid REFERENCES profiles(id),
  -- Datos empresa
  sector          text,
  employees       text,
  annual_revenue  text,
  location        text,
  -- Situación actual
  has_csrd_questionnaire  boolean,
  csrd_sender             text, -- quién lo mandó (Mercadona, Acciona...)
  csrd_deadline           date,
  has_pending_inspection  boolean,
  main_waste_types        text[],
  energy_cost_concern     boolean,
  -- Contexto CE
  ce_maturity     enum('none','basic','intermediate','advanced') DEFAULT 'none',
  main_pain       text,
  raw_answers     jsonb, -- respuestas completas del formulario
  created_at      timestamptz DEFAULT now()
)

-- DOCUMENTS
documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id),
  uploaded_by     uuid REFERENCES profiles(id),
  type            enum('client_upload','generated_draft','final_deliverable','invoice'),
  filename        text NOT NULL,
  storage_path    text NOT NULL,
  size_bytes      integer,
  created_at      timestamptz DEFAULT now()
)

-- AI GENERATIONS
ai_generations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id),
  consultant_id   uuid REFERENCES profiles(id),
  prompt_used     text,
  raw_output      text,
  edited_output   text, -- versión revisada por consultor
  status          enum('generated','reviewed','approved','rejected'),
  tokens_used     integer,
  model           text DEFAULT 'claude-sonnet-4-20250514',
  created_at      timestamptz DEFAULT now()
)

-- MESSAGES (mensajería proyecto)
messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id),
  sender_id       uuid REFERENCES profiles(id),
  content         text NOT NULL,
  read_at         timestamptz,
  created_at      timestamptz DEFAULT now()
)

-- INVOICES
invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id),
  client_id       uuid REFERENCES profiles(id),
  amount_eur      integer,
  stripe_invoice_id text,
  status          enum('draft','sent','paid','overdue'),
  issued_at       date,
  paid_at         timestamptz
)

-- RLS POLICIES (crítico — aplicar a todas las tablas)
-- clients solo ven sus propios datos
-- consultants ven todos los proyectos asignados a ellos
-- admin ve todo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 4. ARQUITECTURA DE RUTAS (App Router)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/                           → Landing page pública
/auth/login                 → Login unificado (detecta rol)
/auth/register              → Registro cliente
/auth/magic-link            → Magic link flow

-- ZONA CLIENTE
/dashboard                  → Home cliente (resumen proyectos)
/dashboard/new              → Onboarding / nuevo proyecto (wizard)
/dashboard/projects/[id]    → Detalle proyecto
/dashboard/projects/[id]/documents  → Documentos del proyecto
/dashboard/messages         → Mensajería
/dashboard/billing          → Facturas y pagos

-- ZONA CONSULTOR
/consultant                 → Inbox de proyectos (Kanban)
/consultant/projects/[id]   → Detalle proyecto + herramientas AI
/consultant/projects/[id]/generate  → Motor de generación Claude
/consultant/projects/[id]/editor    → Editor del entregable
/consultant/analytics       → Métricas (proyectos, ingresos, tiempo)
/consultant/messages        → Mensajería unificada

-- ADMIN
/admin                      → Panel control total
/admin/users                → Gestión usuarios
/admin/projects             → Todos los proyectos
/admin/billing              → Finanzas globales

-- API ROUTES
/api/ai/generate            → Llamada Claude API (server-side)
/api/ai/stream              → Streaming de generación
/api/stripe/checkout        → Crear sesión de pago
/api/stripe/webhook         → Webhook Stripe
/api/pdf/generate           → Generación PDF informe
/api/email/send             → Envío emails (Resend)
/api/upload                 → Upload a Supabase Storage

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 5. MOTOR DE IA — CLAUDE API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Endpoint: POST /api/ai/generate
Model: claude-sonnet-4-20250514
Max tokens: 4000
Streaming: sí (useStreamResponse hook)

SYSTEM PROMPT BASE:
"Eres un consultor experto en Economía Circular con 10 años de experiencia
asesorando PYME españolas. Tu especialidad es traducir la normativa CE
(CSRD, Ley 7/2022, Taxonomía Verde UE) en planes de acción concretos y
rentables. Respondes siempre en español. Eres directo, técnico pero
accesible. No usas jerga medioambiental genérica. Te centras en el impacto
económico real para la empresa."

TIPOS DE GENERACIÓN:
1. csrd_response     → Genera respuesta completa a cuestionario CSRD
2. ce_diagnosis      → Genera diagnóstico CE con scoring por dimensión
3. roadmap           → Genera hoja de ruta 12 meses con KPIs
4. quick_wins        → Identifica 3 oportunidades de ahorro inmediato
5. executive_summary → Resumen ejecutivo para dirección (max 300 palabras)

OUTPUT FORMAT: JSON estructurado para renderizado en PDF
Schema mínimo por tipo en /lib/ai/schemas.ts

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 6. FLUJO COMPLETO — ZONA CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PASO 1 — LANDING
  Headline: "Tu cliente grande acaba de mandarte un cuestionario."
  CTA: "Solicitar diagnóstico gratuito" → /auth/register

PASO 2 — REGISTRO
  Email + contraseña
  Nombre + empresa + sector
  → Crear profile con role='client'
  → Email bienvenida (Resend)

PASO 3 — ONBOARDING WIZARD (4 pasos, barra de progreso)
  Paso 1: Situación ("¿Qué te trajo aquí?")
    - Tengo un cuestionario CSRD pendiente
    - Me van a inspeccionar
    - Quiero reducir costes operativos
    - Quiero saber qué oportunidades CE tengo
  Paso 2: Tu empresa (sector, tamaño, facturación aprox.)
  Paso 3: El problema específico (upload opcional de documentos)
  Paso 4: Urgencia + contacto
  → Crea project en status='draft'
  → Crea intake con raw_answers

PASO 4 — SELECCIÓN DE SERVICIO + PAGO
  Muestra recomendación basada en respuestas del wizard
  Cards de pricing con Stripe Checkout
  → Pago completado → project.status='active'
  → Notificación automática a consultor (email)

PASO 5 — DASHBOARD CLIENTE
  Timeline del proyecto con estados
  Área de mensajes con consultor
  Documentos (upload / descarga de entregables)
  Notificaciones de progreso

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 7. FLUJO COMPLETO — ZONA CONSULTOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISTA PRINCIPAL — KANBAN DE PROYECTOS
  Columnas: Nuevo / En Proceso / En Revisión / Entregado
  Card por proyecto: empresa, tipo, urgencia, deadline, días restantes
  Acceso directo a herramientas desde la card

VISTA PROYECTO — 3 PANELES
  Panel izquierdo:  Info cliente + intake completo
  Panel central:    Motor de generación + editor
  Panel derecho:    Mensajería + documentos + timeline

MOTOR DE GENERACIÓN (panel central):
  1. Consultor selecciona tipo de generación
  2. Puede editar el prompt antes de enviar
  3. Claude genera en streaming (visible en tiempo real)
  4. Editor rico para ajustar el output
  5. Botones: "Aprobar y generar PDF" / "Regenerar" / "Guardar borrador"
  6. PDF generado → subido a Storage → notificación al cliente

PANEL DE ANALÍTICAS:
  Proyectos activos / entregados / ingresos mes
  Tiempo medio por tipo de proyecto
  Satisfacción cliente (rating post-entrega)
  Top sectores y tipos de servicio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 8. GENERACIÓN DE PDF — ENTREGABLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stack: @react-pdf/renderer
Template base: /components/pdf/ReportTemplate.tsx

ESTRUCTURA DEL PDF (según tipo):

CSRD Response:
  - Portada (empresa, fecha, consultor firmante)
  - Índice
  - Resumen ejecutivo
  - Respuestas organizadas por dimensión ESRS
  - Plan de acción recomendado
  - Firma digital del consultor

CE Diagnosis:
  - Portada
  - Scoring radar chart (5 dimensiones)
  - Diagnóstico por dimensión
  - Top 3 Quick Wins
  - Hoja de ruta 12 meses
  - KPIs de seguimiento
  - Fuentes de financiación aplicables
  - Firma

Colores del PDF: usar paleta CIRQLR
  - Fondo portada: #0A0A0A
  - Acento: #C8F060
  - Cuerpo: blanco sobre gris oscuro para portada, negro sobre blanco interior

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 9. STRIPE — MODELO DE PAGOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRODUCTOS STRIPE (crear en dashboard):
  cirqlr_comply     → Respuesta CSRD       → 3.000€ one-time
  cirqlr_audit      → Diagnóstico CE       → 5.500€ one-time
  cirqlr_pro        → Implementación Pro   → 2.500€/mes recurrente

FLUJO:
  1. Cliente selecciona servicio en wizard
  2. /api/stripe/checkout crea PaymentIntent
  3. Redirect a Stripe Checkout hosted
  4. Webhook /api/stripe/webhook confirma pago
  5. project.status → 'active', email automático

FACTURACIÓN:
  Generar factura PDF automática (datos fiscales en profile)
  Subir a Storage + enviar por email
  Registro en tabla invoices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 10. EMAILS TRANSACCIONALES (Resend)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Templates en /emails/ (React Email):
  welcome_client        → Registro completado
  project_created       → Nuevo proyecto creado
  payment_confirmed     → Pago recibido + próximos pasos
  consultant_new_lead   → Nuevo proyecto asignado (a Isabelle/Miguel)
  project_update        → Cambio de estado del proyecto
  deliverable_ready     → Entregable disponible para descarga
  invoice_sent          → Factura adjunta

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 11. SEGURIDAD Y RLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase RLS en TODAS las tablas:
  profiles:     usuario ve solo su propio perfil (admin ve todos)
  projects:     client ve sus proyectos, consultant ve los asignados
  intakes:      solo client owner y consultant asignado
  documents:    solo project participants
  messages:     solo project participants
  ai_generations: solo consultant
  invoices:     client ve las suyas, admin ve todas

Middleware Next.js:
  Proteger todas las rutas /dashboard/* y /consultant/*
  Redirigir a /auth/login si no autenticado
  Redirigir a zona correcta según role

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 12. VARIABLES DE ENTORNO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## 13. ORDEN DE CONSTRUCCIÓN — FASES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FASE 1 — FUNDAMENTOS (semana 1-2)
  [ ] Setup Next.js 14 + TypeScript + Tailwind + shadcn dark theme
  [ ] Supabase: schema completo + RLS policies
  [ ] Auth: login / register / magic link / middleware
  [ ] Routing: estructura de carpetas completa
  [ ] Design system: tokens de color CIRQLR, tipografías, componentes base

FASE 2 — ZONA CLIENTE (semana 2-3)
  [ ] Landing page (/ ruta pública)
  [ ] Onboarding wizard (4 pasos)
  [ ] Dashboard cliente básico
  [ ] Upload de documentos
  [ ] Stripe checkout flow
  [ ] Emails transaccionales básicos

FASE 3 — ZONA CONSULTOR (semana 3-4)
  [ ] Kanban de proyectos
  [ ] Vista detalle proyecto (3 paneles)
  [ ] Motor de generación Claude API con streaming
  [ ] Editor de entregables
  [ ] Generación PDF con react-pdf
  [ ] Mensajería interna

FASE 4 — PULIDO (semana 4-5)
  [ ] Panel analíticas consultor
  [ ] Sistema de notificaciones
  [ ] Gestión de facturas
  [ ] Tests E2E críticos (Playwright)
  [ ] Deploy Vercel + dominio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## INSTRUCCIÓN DE ARRANQUE PARA EL CLI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Empieza por la FASE 1 en este orden exacto:

1. Inicializa el proyecto:
   npx create-next-app@latest cirqlr --typescript --tailwind --app --src-dir

2. Instala dependencias:
   npm install @supabase/supabase-js @supabase/ssr
   npm install @anthropic-ai/sdk stripe @stripe/stripe-js
   npm install resend react-email @react-pdf/renderer
   npm install posthog-js
   npx shadcn@latest init (tema: dark, color base: zinc)

3. Crea el schema SQL completo en /supabase/schema.sql

4. Implementa el design system en /lib/design-tokens.ts
   con todos los colores, tipografías y utilidades de CIRQLR

5. Implementa auth middleware en /middleware.ts
   con redirección por rol

6. Construye la landing page en /app/page.tsx
   siguiendo el diseño de la identidad CIRQLR definida arriba

No pares hasta tener la Fase 1 completa y funcionando.
Después pregunta antes de continuar con la Fase 2.
```
