-- ================================================
-- CIRCULR Seed Data
-- ================================================
-- Run after schema.sql in your Supabase project.
--
-- IMPORTANT: Create auth users first via Supabase Dashboard or API,
-- then replace the UUIDs below with the real auth.users IDs.
-- The handle_new_user() trigger will auto-create profiles.

-- ================================================
-- Step 1: Update the auto-created profiles
-- Replace UUIDs with your actual auth.users IDs
-- ================================================

-- Client user (first auth user you create)
-- UPDATE profiles SET
--   full_name = 'María García López',
--   company_name = 'EcoTextil S.L.',
--   sector = 'Textil y moda',
--   company_size = '51-200',
--   phone = '+34 612 345 678',
--   onboarded = true
-- WHERE id = '<CLIENT_USER_UUID>';

-- Consultant user (second auth user you create)
-- UPDATE profiles SET
--   role = 'consultant',
--   full_name = 'Carlos Rodríguez',
--   company_name = 'CIRCULR',
--   sector = 'Consultoría',
--   onboarded = true
-- WHERE id = '<CONSULTANT_USER_UUID>';

-- ================================================
-- Step 2: Sample project (uncomment after setting UUIDs)
-- ================================================

-- INSERT INTO projects (client_id, consultant_id, type, status, title, description, urgency, price_eur, deadline)
-- VALUES (
--   '<CLIENT_USER_UUID>',
--   '<CONSULTANT_USER_UUID>',
--   'ce_diagnosis',
--   'active',
--   'Diagnóstico CE',
--   'Evaluación completa de madurez en economía circular para EcoTextil S.L.',
--   'standard',
--   150000,
--   CURRENT_DATE + INTERVAL '30 days'
-- );

-- ================================================
-- Step 3: Sample intake (uncomment after project exists)
-- ================================================

-- INSERT INTO intakes (project_id, client_id, sector, employees, annual_revenue, location, has_csrd_questionnaire, csrd_sender, has_pending_inspection, main_waste_types, energy_cost_concern, ce_maturity, main_pain)
-- SELECT
--   p.id,
--   p.client_id,
--   'Textil y moda',
--   '51-200',
--   '12M€',
--   'Barcelona, España',
--   true,
--   'Grupo Inditex',
--   false,
--   ARRAY['Textiles', 'Plásticos', 'Químicos/Peligrosos'],
--   true,
--   'basic',
--   'Necesitamos responder al cuestionario CSRD de nuestra empresa matriz antes de junio. También queremos identificar oportunidades de circularidad en nuestros residuos textiles.'
-- FROM projects p
-- WHERE p.title = 'Diagnóstico CE'
-- LIMIT 1;

-- ================================================
-- Step 4: Sample messages (uncomment after project exists)
-- ================================================

-- INSERT INTO messages (project_id, sender_id, content, created_at)
-- SELECT p.id, p.consultant_id, 'Hola María, he revisado tu cuestionario. Vamos a empezar con el análisis de flujos de materiales.', NOW() - INTERVAL '2 days'
-- FROM projects p WHERE p.title = 'Diagnóstico CE' LIMIT 1;

-- INSERT INTO messages (project_id, sender_id, content, created_at)
-- SELECT p.id, p.client_id, 'Perfecto Carlos, te adjunto también el informe de residuos del año pasado.', NOW() - INTERVAL '1 day'
-- FROM projects p WHERE p.title = 'Diagnóstico CE' LIMIT 1;

-- ================================================
-- Step 5: Sample invoice (uncomment after project + payment)
-- ================================================

-- INSERT INTO invoices (project_id, client_id, amount_eur, status, issued_at, paid_at)
-- SELECT p.id, p.client_id, 150000, 'paid', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '5 days'
-- FROM projects p WHERE p.title = 'Diagnóstico CE' LIMIT 1;
