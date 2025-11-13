export interface AttendanceRecord {
  recordId?: number;
  userId: number;
  username?: string;
  checkInTime?: string;
  checkOutTime?: string;
  recordDate?: string;
  attendanceType?: string;
  status?: string;
}

export interface AttendanceRequest {
  userId: number;
  type: 'CHECK_IN' | 'CHECK_OUT' | 'ANNUAL_LEAVE';
  targetDate?: string; // 対象日付（年休の場合に使用、省略時は今日）
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}
