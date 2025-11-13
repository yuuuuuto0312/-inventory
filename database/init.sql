-- データベース作成
CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 勤怠記録テーブル
CREATE TABLE IF NOT EXISTS attendance_records (
    record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    check_in_time DATETIME,
    check_out_time DATETIME,
    record_date DATETIME NOT NULL,
    attendance_type VARCHAR(20) NOT NULL DEFAULT 'WORK',
    google_calendar_event_id VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_record_date (record_date),
    INDEX idx_attendance_type (attendance_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- サンプルユーザーデータを挿入
INSERT INTO users (username, email, role) VALUES
('山田太郎', 'yamada@example.com', 'USER'),
('佐藤花子', 'sato@example.com', 'USER'),
('管理者', 'admin@example.com', 'ADMIN');

-- サンプル勤怠データを挿入（オプション）
INSERT INTO attendance_records (user_id, check_in_time, check_out_time, record_date) VALUES
(1, '2025-01-10 09:00:00', '2025-01-10 18:00:00', '2025-01-10 09:00:00'),
(2, '2025-01-10 09:15:00', '2025-01-10 17:45:00', '2025-01-10 09:15:00');
