-- ================================================
-- CIRCULR Database Schema
-- ================================================

-- ENUM TYPES
CREATE TYPE user_role AS ENUM ('client', 'consultant', 'admin');
CREATE TYPE project_type AS ENUM ('csrd_response', 'ce_diagnosis', 'implementation', 'training');
CREATE TYPE project_status AS ENUM ('draft', 'pending_payment', 'active', 'in_review', 'delivered', 'closed');
CREATE TYPE urgency_level AS ENUM ('standard', 'urgent', 'critical');
CREATE TYPE doc_type AS ENUM ('client_upload', 'generated_draft', 'final_deliverable', 'invoice');
CREATE TYPE gen_status AS ENUM ('generated', 'reviewed', 'approved', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE ce_maturity AS ENUM ('none', 'basic', 'intermediate', 'advanced');

-- PROFILES
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'client',
  full_name       TEXT,
  company_name    TEXT,
  sector          TEXT,
  company_size    TEXT,
  phone           TEXT,
  onboarded       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE projects (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID REFERENCES profiles(id),
  consultant_id         UUID REFERENCES profiles(id),
  type                  project_type,
  status                project_status DEFAULT 'draft',
  title                 TEXT NOT NULL,
  description           TEXT,
  urgency               urgency_level DEFAULT 'standard',
  price_eur             INTEGER,
  stripe_payment_intent TEXT,
  deadline              DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- INTAKES
CREATE TABLE intakes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id              UUID REFERENCES projects(id),
  client_id               UUID REFERENCES profiles(id),
  sector                  TEXT,
  employees               TEXT,
  annual_revenue          TEXT,
  location                TEXT,
  has_csrd_questionnaire  BOOLEAN,
  csrd_sender             TEXT,
  csrd_deadline           DATE,
  has_pending_inspection  BOOLEAN,
  main_waste_types        TEXT[],
  energy_cost_concern     BOOLEAN,
  ce_maturity             ce_maturity DEFAULT 'none',
  main_pain               TEXT,
  raw_answers             JSONB,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- DOCUMENTS
CREATE TABLE documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES projects(id),
  uploaded_by   UUID REFERENCES profiles(id),
  type          doc_type,
  filename      TEXT NOT NULL,
  storage_path  TEXT NOT NULL,
  size_bytes    INTEGER,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AI GENERATIONS
CREATE TABLE ai_generations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id     UUID REFERENCES projects(id),
  consultant_id  UUID REFERENCES profiles(id),
  prompt_used    TEXT,
  raw_output     TEXT,
  edited_output  TEXT,
  status         gen_status DEFAULT 'generated',
  tokens_used    INTEGER,
  model          TEXT DEFAULT 'claude-sonnet-4-20250514',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id),
  sender_id   UUID REFERENCES profiles(id),
  content     TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID REFERENCES projects(id),
  client_id         UUID REFERENCES profiles(id),
  amount_eur        INTEGER,
  stripe_invoice_id TEXT,
  status            invoice_status DEFAULT 'draft',
  issued_at         DATE,
  paid_at           TIMESTAMPTZ
);

-- WEBHOOK EVENTS (idempotency)
CREATE TABLE webhook_events (
  id              TEXT PRIMARY KEY,  -- Stripe event ID
  event_type      TEXT NOT NULL,
  processed_at    TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOG
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  action      TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users see own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Clients see own projects"
  ON projects FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Consultants see assigned projects"
  ON projects FOR SELECT USING (auth.uid() = consultant_id);

CREATE POLICY "Clients see own intakes"
  ON intakes FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "Project participants see documents"
  ON documents FOR SELECT USING (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

CREATE POLICY "Project participants see messages"
  ON messages FOR SELECT USING (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- TRIGGER: updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- TRIGGER: auto-create profile on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- EXTENDED RLS POLICIES

-- Profiles: allow users to insert their own profile (fallback for trigger)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles: allow users to update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: clients can insert own projects
CREATE POLICY "Clients can insert projects"
  ON projects FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Projects: participants can update their projects
CREATE POLICY "Participants can update projects"
  ON projects FOR UPDATE USING (
    auth.uid() = client_id OR auth.uid() = consultant_id
  );

-- Consultants can see all intakes for their projects
CREATE POLICY "Consultants see project intakes"
  ON intakes FOR SELECT USING (
    auth.uid() IN (
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- Clients can insert intakes
CREATE POLICY "Clients can insert intakes"
  ON intakes FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can update their own intakes
CREATE POLICY "Clients can update intakes"
  ON intakes FOR UPDATE USING (auth.uid() = client_id);

-- Documents: participants can insert
CREATE POLICY "Participants can insert documents"
  ON documents FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- AI generations: consultants can see their project generations
CREATE POLICY "Consultants see project generations"
  ON ai_generations FOR SELECT USING (
    auth.uid() IN (
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- AI generations: consultants can insert
CREATE POLICY "Consultants can insert generations"
  ON ai_generations FOR INSERT WITH CHECK (auth.uid() = consultant_id);

-- AI generations: consultants can update their own
CREATE POLICY "Consultants can update generations"
  ON ai_generations FOR UPDATE USING (auth.uid() = consultant_id);

-- Messages: participants can insert
CREATE POLICY "Participants can insert messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- Messages: participants can update (mark as read)
CREATE POLICY "Participants can update messages"
  ON messages FOR UPDATE USING (
    auth.uid() IN (
      SELECT client_id FROM projects WHERE id = project_id
      UNION
      SELECT consultant_id FROM projects WHERE id = project_id
    )
  );

-- Invoices: clients can see own invoices
CREATE POLICY "Clients see own invoices"
  ON invoices FOR SELECT USING (auth.uid() = client_id);

-- Invoices: service role can insert (via webhook)
CREATE POLICY "Service role can insert invoices"
  ON invoices FOR INSERT WITH CHECK (true);

-- ADMIN POLICIES
-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Admins can read all profiles
CREATE POLICY "Admins see all profiles"
  ON profiles FOR SELECT USING (is_admin());

-- Admins can update any profile (role changes)
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE USING (is_admin());

-- Admins can read all projects
CREATE POLICY "Admins see all projects"
  ON projects FOR SELECT USING (is_admin());

-- Admins can read all invoices
CREATE POLICY "Admins see all invoices"
  ON invoices FOR SELECT USING (is_admin());

-- Admins can read all AI generations
CREATE POLICY "Admins see all generations"
  ON ai_generations FOR SELECT USING (is_admin());

-- Admins can read all messages
CREATE POLICY "Admins see all messages"
  ON messages FOR SELECT USING (is_admin());

-- Admins can read all documents
CREATE POLICY "Admins see all documents"
  ON documents FOR SELECT USING (is_admin());

-- Admins can read all intakes
CREATE POLICY "Admins see all intakes"
  ON intakes FOR SELECT USING (is_admin());

-- QUICK ORDERS (self-service tools)
CREATE TYPE quick_order_status AS ENUM ('pending', 'processing', 'consultant_review', 'completed');

CREATE TABLE quick_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  email             TEXT NOT NULL,
  name              TEXT,
  company           TEXT,
  product_slug      TEXT NOT NULL,
  status            quick_order_status DEFAULT 'pending',
  input_data        JSONB,
  output_data       JSONB,
  output_url        TEXT,
  amount_cents      INTEGER DEFAULT 0,
  stripe_session_id TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quick_orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public form submissions)
CREATE POLICY "Public can insert quick_orders"
  ON quick_orders FOR INSERT WITH CHECK (true);

-- Admins and consultants can see all orders
CREATE POLICY "Admins see all quick_orders"
  ON quick_orders FOR SELECT USING (is_admin());

CREATE POLICY "Consultants see all quick_orders"
  ON quick_orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'consultant')
  );

-- Admins and consultants can update orders
CREATE POLICY "Admins update quick_orders"
  ON quick_orders FOR UPDATE USING (is_admin());

CREATE POLICY "Consultants update quick_orders"
  ON quick_orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'consultant')
  );

CREATE TRIGGER quick_orders_updated_at
  BEFORE UPDATE ON quick_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ENABLE REALTIME on messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
