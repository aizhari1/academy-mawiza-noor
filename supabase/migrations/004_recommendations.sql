-- ترشيحات (كتب / فيديوهات / دورات) — تُدار من لوحة الإدارة

CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('book', 'video', 'course')),
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  url TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_type ON recommendations(type);
CREATE INDEX IF NOT EXISTS idx_recommendations_active ON recommendations(is_active);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_recommendations" ON recommendations;
DROP POLICY IF EXISTS "auth_all_recommendations" ON recommendations;

-- الزوار يقرأون النشط فقط
CREATE POLICY "anon_read_recommendations" ON recommendations
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- المسجّلون (إدارة) يتحكّمون بالكامل
CREATE POLICY "auth_all_recommendations" ON recommendations
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- بيانات تجريبية أولية
INSERT INTO recommendations (type, title, author, description, url, is_featured, sort_order) VALUES
  ('book', 'تفسير السعدي', 'عبد الرحمن السعدي', 'تفسير ميسر وواضح يناسب المبتدئين والمتقدمين', NULL, true, 1),
  ('book', 'التبيان في آداب حملة القرآن', 'النووي', 'آداب حامل القرآن وأخلاق أهل القرآن', NULL, false, 2),
  ('video', 'شرح أحكام التجويد', 'قناة الأكاديمية', 'سلسلة مبسطة لأحكام التجويد من البداية', 'https://www.youtube.com', true, 3),
  ('course', 'دورة الحفظ للمبتدئين', 'أكاديمية موعظة ونور', 'خطة 30 يومًا لبدء الحفظ بثبات', NULL, true, 4)
ON CONFLICT DO NOTHING;
