-- ============================================================
-- Church Management System — Complete Database Schema
-- كنيسة الثلاثة فتية القديسين — أسوان
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  student_code   TEXT PRIMARY KEY,              -- REG-XXXXXX
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL UNIQUE,
  parent_phone   TEXT NOT NULL,
  stage          TEXT NOT NULL,                 -- الصف الأول الإعدادي ... إلخ
  birthday       DATE,
  confessor      TEXT,
  points         INT4 DEFAULT 0,
  qr_code        TEXT UNIQUE,                   -- UUID stored as QR data
  photo_url      TEXT,
  active         BOOLEAN DEFAULT FALSE,
  status         TEXT DEFAULT '0',              -- '0'=pending, '1'=approved, '-1'=rejected
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id     TEXT NOT NULL REFERENCES students(student_code) ON DELETE CASCADE,
  student_name   TEXT NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  time           TIME NOT NULL DEFAULT CURRENT_TIME,
  status         TEXT DEFAULT 'present',
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)                      -- Anti-duplicate per day
);

-- ============================================================
-- TABLE: points_log
-- ============================================================
CREATE TABLE IF NOT EXISTS points_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id     TEXT NOT NULL REFERENCES students(student_code) ON DELETE CASCADE,
  student_name   TEXT NOT NULL,
  points         INT4 NOT NULL,                 -- positive = add, negative = deduct
  reason         TEXT NOT NULL,
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL UNIQUE,
  role           TEXT DEFAULT 'admin',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_phone    ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_status   ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_stage    ON students(stage);
CREATE INDEX IF NOT EXISTS idx_attendance_date   ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_points_log_student ON points_log(student_id);
CREATE INDEX IF NOT EXISTS idx_points_log_date   ON points_log(date);

-- ============================================================
-- FUNCTION: auto-update updated_at on students
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: auto-generate student_code
-- Format: REG-XXXXXX (6 uppercase alphanumeric chars)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    new_code := 'REG-' || upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM students WHERE student_code = new_code) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: auto-generate QR code (UUID) on approval
-- Triggered when status changes from '0' → '1'
-- ============================================================
CREATE OR REPLACE FUNCTION auto_generate_qr_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = '1' AND OLD.status != '1' THEN
    IF NEW.qr_code IS NULL THEN
      NEW.qr_code := uuid_generate_v4()::TEXT;
    END IF;
    NEW.active := TRUE;
  END IF;
  IF NEW.status = '-1' THEN
    NEW.active := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_qr_on_approval
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION auto_generate_qr_on_approval();

-- ============================================================
-- FUNCTION: auto award points (4 attendance in same month = 1 point)
-- Called after INSERT on attendance
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_award_monthly_points()
RETURNS TRIGGER AS $$
DECLARE
  monthly_count INT;
  month_year    TEXT;
  already_awarded BOOLEAN;
BEGIN
  -- Count attendance for this student in the current month
  month_year := TO_CHAR(NEW.date, 'YYYY-MM');
  
  SELECT COUNT(*) INTO monthly_count
  FROM attendance
  WHERE student_id = NEW.student_id
    AND TO_CHAR(date, 'YYYY-MM') = month_year;

  -- Check if already awarded this month
  SELECT EXISTS(
    SELECT 1 FROM points_log
    WHERE student_id = NEW.student_id
      AND TO_CHAR(date, 'YYYY-MM') = month_year
      AND reason LIKE 'مكافأة الحضور%'
  ) INTO already_awarded;

  -- Award 1 point every 4 attendances (only once per 4)
  IF monthly_count % 4 = 0 AND NOT already_awarded THEN
    -- Insert points log
    INSERT INTO points_log (student_id, student_name, points, reason, date)
    VALUES (
      NEW.student_id,
      NEW.student_name,
      1,
      'مكافأة الحضور – ' || TO_CHAR(NEW.date, 'Month YYYY'),
      NEW.date
    );
    -- Update student total points
    UPDATE students SET points = points + 1 WHERE student_code = NEW.student_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_award_points_on_attendance
  AFTER INSERT ON attendance
  FOR EACH ROW EXECUTE FUNCTION check_and_award_monthly_points();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE students    ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance  ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins      ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE email = (auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── STUDENTS ──────────────────────────────────────────────
-- Admins: full access
CREATE POLICY "admins_all_students" ON students
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public: read approved+active students only (for student login lookup)
CREATE POLICY "public_read_approved_students" ON students
  FOR SELECT
  USING (status = '1' AND active = TRUE);

-- Public: insert new registration (pending)
CREATE POLICY "public_insert_registration" ON students
  FOR INSERT
  WITH CHECK (status = '0' AND active = FALSE);

-- ── ATTENDANCE ────────────────────────────────────────────
-- Admins: full access
CREATE POLICY "admins_all_attendance" ON attendance
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public: read attendance (for student profile)
CREATE POLICY "public_read_attendance" ON attendance
  FOR SELECT
  USING (TRUE);

-- ── POINTS LOG ────────────────────────────────────────────
-- Admins: full access
CREATE POLICY "admins_all_points_log" ON points_log
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Public: read points log
CREATE POLICY "public_read_points_log" ON points_log
  FOR SELECT
  USING (TRUE);

-- ── ADMINS ────────────────────────────────────────────────
-- Only admins can read admins table
CREATE POLICY "admins_read_admins" ON admins
  FOR SELECT
  USING (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Run in Supabase Storage UI or via API:
-- 1. Create bucket: "student-photos" (public)
-- 2. Create bucket: "id-cards" (private)

-- Storage policies (run after creating buckets):
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('id-cards', 'id-cards', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read student photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'student-photos');

CREATE POLICY "Authenticated upload student photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'student-photos');

CREATE POLICY "Admins access id-cards" ON storage.objects
  FOR ALL USING (bucket_id = 'id-cards' AND is_admin());

-- ============================================================
-- SEED: Insert first admin (run once after Supabase Auth signup)
-- Replace the email with your actual admin email
-- ============================================================
-- INSERT INTO admins (name, email, role)
-- VALUES ('مارك', 'mark@church.com', 'admin')
-- ON CONFLICT (email) DO NOTHING;
