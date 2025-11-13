import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceRecord, User } from '../../models/attendance.model';
import { AttendanceService } from '../../services/attendance.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // タブ管理
  activeTab: 'attendance' | 'users' = 'attendance';

  // 勤怠記録関連
  startDate: string = '';
  endDate: string = '';
  records: AttendanceRecord[] = [];

  // ユーザー管理関連
  users: User[] = [];
  newUser: { username: string; email: string; role: string } = {
    username: '',
    email: '',
    role: 'EMPLOYEE'
  };
  editingUser: User | null = null;
  showUserForm: boolean = false;

  message: string = '';
  messageType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private attendanceService: AttendanceService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // デフォルトで今月の期間を設定
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.startDate = this.formatDateForInput(firstDay);
    this.endDate = this.formatDateForInput(lastDay);

    // ユーザー一覧を読み込む
    this.loadUsers();
  }

  /**
   * タブ切り替え
   */
  switchTab(tab: 'attendance' | 'users'): void {
    this.activeTab = tab;
    if (tab === 'users') {
      this.loadUsers();
    }
  }

  /**
   * ユーザー一覧を読み込む
   */
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        this.showMessage('ユーザー一覧の取得に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * ユーザー追加フォームを表示
   */
  showAddUserForm(): void {
    this.showUserForm = true;
    this.editingUser = null;
    this.newUser = { username: '', email: '', role: 'EMPLOYEE' };
  }

  /**
   * ユーザー編集フォームを表示
   */
  showEditUserForm(user: User): void {
    this.showUserForm = true;
    this.editingUser = user;
    this.newUser = {
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  /**
   * フォームをキャンセル
   */
  cancelUserForm(): void {
    this.showUserForm = false;
    this.editingUser = null;
    this.newUser = { username: '', email: '', role: 'EMPLOYEE' };
  }

  /**
   * ユーザーを作成
   */
  createUser(): void {
    if (!this.newUser.username || !this.newUser.email) {
      this.showMessage('ユーザー名とメールアドレスは必須です', 'error');
      return;
    }

    const userToCreate: User = {
      userId: 0, // サーバー側で自動生成される
      username: this.newUser.username,
      email: this.newUser.email,
      role: this.newUser.role
    };

    this.userService.createUser(userToCreate).subscribe({
      next: (user) => {
        this.showMessage(`ユーザー「${user.username}」を追加しました`, 'success');
        this.loadUsers();
        this.cancelUserForm();
      },
      error: (err) => {
        this.showMessage('ユーザーの追加に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * ユーザーを更新
   */
  updateUser(): void {
    if (!this.editingUser) return;

    if (!this.newUser.username || !this.newUser.email) {
      this.showMessage('ユーザー名とメールアドレスは必須です', 'error');
      return;
    }

    this.userService.updateUser(this.editingUser.userId, {
      username: this.newUser.username,
      email: this.newUser.email,
      role: this.newUser.role
    }).subscribe({
      next: (user) => {
        if (user) {
          this.showMessage(`ユーザー「${user.username}」を更新しました`, 'success');
          this.loadUsers();
          this.cancelUserForm();
        } else {
          this.showMessage('ユーザーが見つかりませんでした', 'error');
        }
      },
      error: (err) => {
        this.showMessage('ユーザーの更新に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * ユーザーを削除
   */
  deleteUser(user: User): void {
    if (!confirm(`ユーザー「${user.username}」を削除しますか？`)) {
      return;
    }

    this.userService.deleteUser(user.userId).subscribe({
      next: () => {
        this.showMessage(`ユーザー「${user.username}」を削除しました`, 'success');
        this.loadUsers();
      },
      error: (err) => {
        this.showMessage('ユーザーの削除に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * 役割の表示名を取得
   */
  getRoleDisplayName(role: string): string {
    return role === 'ADMIN' ? '管理者' : '一般ユーザー';
  }

  /**
   * 勤怠記録を検索
   */
  searchRecords(): void {
    if (!this.startDate || !this.endDate) {
      this.showMessage('開始日と終了日を入力してください', 'error');
      return;
    }

    const startDateTime = new Date(this.startDate).toISOString();
    const endDateTime = new Date(this.endDate + 'T23:59:59').toISOString();

    this.attendanceService.getAttendanceByDateRange(startDateTime, endDateTime).subscribe({
      next: (records) => {
        this.records = records;
        this.showMessage(`${records.length}件の記録が見つかりました`, 'success');
      },
      error: (err) => {
        this.showMessage('勤怠記録の取得に失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * Excelエクスポート
   */
  exportExcel(): void {
    if (!this.startDate || !this.endDate) {
      this.showMessage('開始日と終了日を入力してください', 'error');
      return;
    }

    const startDateTime = new Date(this.startDate).toISOString();
    const endDateTime = new Date(this.endDate + 'T23:59:59').toISOString();

    this.attendanceService.exportToExcel(startDateTime, endDateTime).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance_${this.startDate}_to_${this.endDate}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.showMessage('Excelファイルをダウンロードしました', 'success');
      },
      error: (err) => {
        this.showMessage('Excelエクスポートに失敗しました', 'error');
        console.error(err);
      }
    });
  }

  /**
   * 日付フォーマット
   */
  formatDate(dateTime: string | undefined): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleDateString('ja-JP');
  }

  /**
   * 時刻フォーマット
   */
  formatTime(dateTime: string | undefined): string {
    if (!dateTime) return '-';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * 入力用日付フォーマット
   */
  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  /**
   * 勤務時間を計算
   */
  calculateWorkHours(record: AttendanceRecord): string {
    if (!record.checkInTime || !record.checkOutTime) return '-';

    const checkIn = new Date(record.checkInTime);
    const checkOut = new Date(record.checkOutTime);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}時間${minutes}分`;
  }
}
