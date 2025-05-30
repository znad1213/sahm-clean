/*
  # إضافة جدول عملائنا المميزين

  1. جدول جديد
    - `clients`
      - `id` (uuid, المفتاح الرئيسي)
      - `name` (text, اسم العميل)
      - `logo_url` (text, شعار العميل)
      - `logo_storage_path` (text, مسار تخزين الشعار)
      - `order` (integer, ترتيب العرض)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. الأمان
    - تفعيل RLS
    - سياسات للقراءة العامة
    - سياسات للتحكم الكامل للمسؤولين
*/

-- إنشاء جدول عملائنا
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  logo_storage_path text,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة العامة
CREATE POLICY "Allow public read access to clients"
ON clients
FOR SELECT
TO public
USING (true);

-- سياسة التحكم الكامل للمسؤولين
CREATE POLICY "Allow admin full access to clients"
ON clients
TO public
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
)
WITH CHECK (
  auth.role() = 'authenticated' AND 
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);