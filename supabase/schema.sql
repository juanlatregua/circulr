-- ================================================
-- CIRQLR Database Schema
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

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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
