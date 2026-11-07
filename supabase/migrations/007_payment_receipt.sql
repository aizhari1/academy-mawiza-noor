-- إيصال اختياري للدفعات
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
