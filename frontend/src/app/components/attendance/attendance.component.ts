import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AttendanceRecord, User } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';
import { UserService } from '../../services/user.service';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasRecords: boolean;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {
  users: User[] = [];
  todayRecords: Map<number, AttendanceRecord> = new Map();
  message: string = '';
  messageType: 'success' | 'error' | 'info' = 'info';

  // カレンダー関連
  selectedDate: Date = new Date();
  currentMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: string[] = ['日', '月', '火', '水', '木', '金', '土'];

  constructor(
    private attendanceService: AttendanceService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.generateCalendar();
  }

  /**
   * 全ユーザーを読み込み
   */
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loadTodayAttendance();
      },
      error: (err) => {
        this.showMessage('ユーザー情報の取得に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * 今日の全ユーザーの勤怠状況を読み込み
   */
  loadTodayAttendance(): void {
    this.loadAttendanceForDate(this.selectedDate);
  }

  /**
   * 指定日の全ユーザーの勤怠状況を読み込み
   */
  loadAttendanceForDate(date: Date): void {
    this.todayRecords.clear();
    this.users.forEach(user => {
      this.attendanceService.getTodayAttendance(user.userId).subscribe({
        next: (record) => {
          if (record && this.isSameDate(new Date(record.recordDate!), date)) {
            this.todayRecords.set(user.userId, record);
          }
        },
        error: (err) => {
          console.error(`ユーザー${user.userId}の勤怠情報取得に失敗`, err);
        }
      });
    });
  }

  /**
   * カレンダーを生成
   */
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // カレンダーの開始日（前月の日付を含む）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // カレンダーの終了日（次月の日付を含む）
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    this.calendarDays = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isSameDate(currentDate, new Date()),
        isSelected: this.isSameDate(currentDate, this.selectedDate),
        hasRecords: false // 後で実装可能
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  /**
   * 日付が同じかチェック
   */
  isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * 前月へ移動
   */
  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendar();
  }

  /**
   * 次月へ移動
   */
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
  }

  /**
   * カレンダーの日付をクリック
   */
  selectDate(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;

    this.selectedDate = day.date;
    this.generateCalendar();
    this.loadAttendanceForDate(this.selectedDate);
  }

  /**
   * 現在の月を表示用にフォーマット
   */
  getMonthYearText(): string {
    return `${this.currentMonth.getFullYear()}年 ${this.currentMonth.getMonth() + 1}月`;
  }

  /**
   * 選択中の日付を表示用にフォーマット
   */
  getSelectedDateText(): string {
    return `${this.selectedDate.getFullYear()}年${this.selectedDate.getMonth() + 1}月${this.selectedDate.getDate()}日`;
  }

  /**
   * 出勤ボタンクリック
   */
  checkIn(userId: number, username: string): void {
    const existing = this.todayRecords.get(userId);
    if (existing) {
      this.showMessage(`${username}さんは既に記録済みです`, 'error');
      return;
    }

    this.attendanceService.recordAttendance({
      userId: userId,
      type: 'CHECK_IN'
    }).subscribe({
      next: (record) => {
        this.todayRecords.set(userId, record);
        this.showMessage(`${username}さんの出勤を記録しました`, 'success');
      },
      error: (err) => {
        this.showMessage('出勤の記録に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * 退勤ボタンクリック
   */
  checkOut(userId: number, username: string): void {
    const existing = this.todayRecords.get(userId);
    if (!existing || !existing.checkInTime) {
      this.showMessage(`${username}さんは先に出勤してください`, 'error');
      return;
    }
    if (existing.checkOutTime) {
      this.showMessage(`${username}さんは既に退勤済みです`, 'error');
      return;
    }

    this.attendanceService.recordAttendance({
      userId: userId,
      type: 'CHECK_OUT'
    }).subscribe({
      next: (record) => {
        this.todayRecords.set(userId, record);
        this.showMessage(`${username}さんの退勤を記録しました`, 'success');
      },
      error: (err) => {
        this.showMessage('退勤の記録に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * 年休ボタンクリック
   */
  annualLeave(userId: number, username: string): void {
    const existing = this.todayRecords.get(userId);
    if (existing) {
      this.showMessage(`${username}さんは既に記録済みです`, 'error');
      return;
    }

    this.attendanceService.recordAttendance({
      userId: userId,
      type: 'ANNUAL_LEAVE',
      targetDate: this.selectedDate.toISOString()
    }).subscribe({
      next: (record) => {
        this.todayRecords.set(userId, record);
        this.showMessage(`${username}さんの年休を記録しました`, 'success');
      },
      error: (err) => {
        this.showMessage('年休の記録に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * ユーザーの今日の記録を取得
   */
  getTodayRecord(userId: number): AttendanceRecord | undefined {
    return this.todayRecords.get(userId);
  }

  /**
   * ボタンの有効/無効判定
   */
  canCheckIn(userId: number): boolean {
    return !this.todayRecords.has(userId);
  }

  canCheckOut(userId: number): boolean {
    const record = this.todayRecords.get(userId);
    return record != null && record.checkInTime != null && record.checkOutTime == null && record.attendanceType === 'WORK';
  }

  canAnnualLeave(userId: number): boolean {
    return !this.todayRecords.has(userId);
  }

  /**
   * ステータス表示
   */
  getStatusText(userId: number): string {
    const record = this.todayRecords.get(userId);
    if (!record) return '未登録';
    if (record.attendanceType === 'ANNUAL_LEAVE') return '年休';
    if (record.checkOutTime) return '退勤済み';
    if (record.checkInTime) return '勤務中';
    return '未登録';
  }

  /**
   * メッセージ表示
   */
  private showMessage(msg: string, type: 'success' | 'error' | 'info'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
