import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AttendanceRecord, AttendanceRequest } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/api/attendance`;

  constructor(private http: HttpClient) { }

  /**
   * 出勤・退勤を記録
   */
  recordAttendance(request: AttendanceRequest): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/record`, request);
  }

  /**
   * ユーザーの勤怠記録を取得
   */
  getUserAttendanceRecords(userId: number): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * 今日の勤怠状況を取得
   */
  getTodayAttendance(userId: number): Observable<AttendanceRecord> {
    return this.http.get<AttendanceRecord>(`${this.apiUrl}/today/${userId}`);
  }

  /**
   * 期間指定で勤怠記録を取得
   */
  getAttendanceByDateRange(startDate: string, endDate: string): Observable<AttendanceRecord[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get<AttendanceRecord[]>(`${this.apiUrl}/range`, { params });
  }

  /**
   * Excelエクスポート
   */
  exportToExcel(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
