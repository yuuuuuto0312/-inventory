-- 既存のattendance_recordsテーブルにattendance_typeカラムを追加するマイグレーション

USE attendance_db;

-- attendance_typeカラムを追加
ALTER TABLE attendance_records
ADD COLUMN attendance_type VARCHAR(20) NOT NULL DEFAULT 'WORK' AFTER record_date;

-- 既存データをWORKに設定（既にデフォルト値で設定されるが明示的に実行）
UPDATE attendance_records
SET attendance_type = 'WORK'
WHERE attendance_type IS NULL OR attendance_type = '';

-- check_in_timeをNULLABLEに変更（年休の場合はNULL）
ALTER TABLE attendance_records
MODIFY COLUMN check_in_time DATETIME NULL;

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX idx_attendance_type ON attendance_records(attendance_type);

-- 確認用クエリ
SELECT 
    TABLE_NAME, 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'attendance_db' 
  AND TABLE_NAME = 'attendance_records'
  AND COLUMN_NAME IN ('check_in_time', 'attendance_type');
