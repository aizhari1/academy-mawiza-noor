-- 005 — نظام الكورسات + لاندنج بيدج قابلة للتعديل
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_desc TEXT,
  description TEXT,
  cover_url TEXT,
  price NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'EGP',
  instructor TEXT,
  duration_label TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'video' CHECK (kind IN ('video','image','file','link')),
  storage_path TEXT,
  external_url TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON course_lessons(course_id, position);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  guest_name TEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','suspended')),
  activated_at TIMESTAMPTZ,
  activated_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_enroll_student ON course_enrollments(course_id, student_id) WHERE student_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_enroll_guest ON course_enrollments(course_id, guest_phone) WHERE student_id IS NULL AND guest_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enroll_student ON course_enrollments(student_id, status);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public) VALUES ('landing-media', 'landing-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', false) ON CONFLICT (id) DO NOTHING;
