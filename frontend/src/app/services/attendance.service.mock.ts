import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AttendanceRecord, AttendanceRequest } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceServiceMock {
  // ユーザー名マッピング（簡易版）
  private userNames: { [key: number]: string } = {
    1: '山田太郎',
    2: '佐藤花子',
    3: '管理者',
    4: '鈴木一郎',
    5: '田中美咲'
  };

  // メモリ内ストレージ - 過去1ヶ月分のダミーデータを生成
  private records: AttendanceRecord[] = [];
  private nextRecordId = 1;

  constructor() {
    this.generateDummyData();
  }

  /**
   * ダミーデータを生成（過去1ヶ月分）
   */
  private generateDummyData(): void {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // 各ユーザーに対して過去1ヶ月分のデータを生成
    [1, 2, 3, 4, 5].forEach(userId => {
      const currentDate = new Date(oneMonthAgo);

      while (currentDate <= today) {
        // 土日はスキップ（一部のユーザーは土曜日も出勤）
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0; // 日曜日のみ休み

        if (!isWeekend) {
          // ランダムで年休を設定（10%の確率）
          const isAnnualLeave = Math.random() < 0.1;

          if (isAnnualLeave) {
            // 年休
            this.records.push({
              recordId: this.nextRecordId++,
              userId: userId,
              username: this.userNames[userId],
              checkInTime: undefined,
              checkOutTime: undefined,
              recordDate: new Date(currentDate).toISOString(),
              attendanceType: 'ANNUAL_LEAVE',
              status: 'ANNUAL_LEAVE'
            });
          } else {
            // 通常勤務
            const checkInHour = 9 + Math.floor(Math.random() * 2); // 9-10時
            const checkInMinute = Math.floor(Math.random() * 60);
            const checkOutHour = 17 + Math.floor(Math.random() * 3); // 17-19時
            const checkOutMinute = Math.floor(Math.random() * 60);

            const checkInTime = new Date(currentDate);
            checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

            const checkOutTime = new Date(currentDate);
            checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

            // 未来の日付や今日の場合は退勤時刻をnullにする可能性がある
            const isFuture = currentDate > today;
            const isToday = this.isSameDate(currentDate, today);
            const hasCheckedOut = !isFuture && (!isToday || Math.random() < 0.5);

            this.records.push({
              recordId: this.nextRecordId++,
              userId: userId,
              username: this.userNames[userId],
              checkInTime: checkInTime.toISOString(),
              checkOutTime: hasCheckedOut ? checkOutTime.toISOString() : undefined,
              recordDate: checkInTime.toISOString(),
              attendanceType: 'WORK',
              status: hasCheckedOut ? 'COMPLETED' : 'IN_PROGRESS'
            });
          }
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    console.log(`生成されたダミーデータ: ${this.records.length}件`);
  }

  /**
   * 日付が同じかチェック
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  /**
   * 出勤・退勤を記録
   */
  recordAttendance(request: AttendanceRequest): Observable<AttendanceRecord> {
    return new Observable(observer => {
      setTimeout(() => {
        const now = new Date();

        // 対象日付を決定（targetDateがあればそれを使用、なければ今日）
        let targetDate: Date;
        if (request.targetDate) {
          targetDate = new Date(request.targetDate);
        } else {
          targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        // 対象日の既存レコードを探す
        let existingRecord = this.records.find(r =>
          r.userId === request.userId &&
          this.isSameDate(new Date(r.recordDate!), targetDate)
        );

        if (request.type === 'CHECK_IN') {
          if (existingRecord && existingRecord.checkInTime) {
            observer.error(new Error('既に出勤記録が存在します'));
            return;
          }

          const newRecord: AttendanceRecord = {
            recordId: this.nextRecordId++,
            userId: request.userId,
            username: this.userNames[request.userId] || 'Unknown User',
            checkInTime: now.toISOString(),
            checkOutTime: undefined,
            recordDate: now.toISOString(),
            attendanceType: 'WORK',
            status: 'IN_PROGRESS'
          };
          this.records.push(newRecord);
          observer.next(newRecord);
          observer.complete();

        } else if (request.type === 'CHECK_OUT') {
          if (!existingRecord || !existingRecord.checkInTime) {
            observer.error(new Error('出勤記録が見つかりません'));
            return;
          }
          if (existingRecord.checkOutTime) {
            observer.error(new Error('既に退勤記録が存在します'));
            return;
          }

          existingRecord.checkOutTime = now.toISOString();
          existingRecord.status = 'COMPLETED';
          observer.next(existingRecord);
          observer.complete();

        } else if (request.type === 'ANNUAL_LEAVE') {
          if (existingRecord) {
            observer.error(new Error('既にその日の勤怠記録が存在します'));
            return;
          }

          // 年休は指定された日付で記録
          const leaveDate = new Date(targetDate);
          leaveDate.setHours(0, 0, 0, 0);

          const newRecord: AttendanceRecord = {
            recordId: this.nextRecordId++,
            userId: request.userId,
            username: this.userNames[request.userId] || 'Unknown User',
            checkInTime: undefined,
            checkOutTime: undefined,
            recordDate: leaveDate.toISOString(),
            attendanceType: 'ANNUAL_LEAVE',
            status: 'ANNUAL_LEAVE'
          };
          this.records.push(newRecord);
          observer.next(newRecord);
          observer.complete();
        }
      }, 300); // 300ms遅延でネットワーク遅延をシミュレート
    });
  }

  /**
   * ユーザーの勤怠記録を取得
   */
  getUserAttendanceRecords(userId: number): Observable<AttendanceRecord[]> {
    const userRecords = this.records
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.recordDate!).getTime() - new Date(a.recordDate!).getTime());
    return of(userRecords).pipe(delay(200));
  }

  /**
   * 今日の勤怠状況を取得
   */
  getTodayAttendance(userId: number): Observable<AttendanceRecord | null> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayRecord = this.records.find(r =>
      r.userId === userId &&
      new Date(r.recordDate!).toDateString() === todayStart.toDateString()
    );

    return of(todayRecord || null).pipe(delay(200));
  }

  /**
   * 期間指定で勤怠記録を取得
   */
  getAttendanceByDateRange(startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredRecords = this.records.filter(r => {
      const recordDate = new Date(r.recordDate!);
      return recordDate >= start && recordDate <= end;
    }).sort((a, b) => {
      // ユーザーID順、日付順でソート
      if (a.userId !== b.userId) {
        return a.userId - b.userId;
      }
      return new Date(a.recordDate!).getTime() - new Date(b.recordDate!).getTime();
    });

    return of(filteredRecords).pipe(delay(300));
  }

  /**
   * Excelエクスポート（モック）
   */
  exportToExcel(startDate: string, endDate: string): Observable<Blob> {
    // 実際のExcelファイルの代わりにダミーのBlobを返す
    const content = `勤怠記録\n期間: ${startDate} - ${endDate}\n\nこれはモックデータです`;
    const blob = new Blob([content], { type: 'text/plain' });
    return of(blob).pipe(delay(500));
  }

  /**
   * デバッグ用: すべてのレコードをリセット
   */
  resetRecords(): void {
    this.records = [];
    this.nextRecordId = 1;
    this.generateDummyData();
  }

  /**
   * デバッグ用: すべてのレコードを取得
   */
  getAllRecords(): AttendanceRecord[] {
    return [...this.records];
  }
}
