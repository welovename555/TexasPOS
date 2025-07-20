# 🗄️ ตรวจสอบ Database Schema

## ✅ ตาราง `sales` ปัจจุบัน:
```sql
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  transaction_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  shift_id uuid,
  product_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_per_unit numeric NOT NULL,
  total_item_price numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method = ANY (ARRAY['cash'::text, 'transfer'::text])),
  note text -- 🆕 คอลัมน์ใหม่ที่เพิ่ม
);
```

## 🔍 สิ่งที่ต้องตรวจสอบใน Supabase:

### 1. คอลัมน์ `note` ถูกเพิ่มแล้วหรือยัง?
- ไปที่ Supabase Dashboard
- เลือก Table Editor
- เปิดตาราง `sales`
- ดูว่ามีคอลัมน์ `note` หรือไม่

### 2. ถ้ายังไม่มี ให้รันคำสั่งนี้:
```sql
ALTER TABLE sales ADD COLUMN note text;
COMMENT ON COLUMN sales.note IS 'หมายเหตุเพิ่มเติมสำหรับการขายแต่ละรายการ';
```

### 3. ตรวจสอบ RLS (Row Level Security):
- คอลัมน์ `note` จะใช้ policy เดียวกับตารางเดิม
- ไม่ต้องเพิ่ม policy ใหม่

## 📊 ตัวอย่างข้อมูลที่จะบันทึก:
```json
{
  "transaction_id": "uuid-here",
  "employee_id": "uuid-here", 
  "product_id": "uuid-here",
  "quantity": 2,
  "price_per_unit": 50.00,
  "total_item_price": 100.00,
  "payment_method": "cash",
  "note": "ลูกค้าขอไม่ใส่น้ำแข็ง" // 🆕 หมายเหตุใหม่
}
```