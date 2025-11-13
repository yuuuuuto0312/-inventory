import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../models/attendance.model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceMock {
  // ダミーユーザーデータ
  private users: User[] = [
    {
      userId: 1,
      username: '山田太郎',
      email: 'yamada@example.com',
      role: 'EMPLOYEE'
    },
    {
      userId: 2,
      username: '佐藤花子',
      email: 'sato@example.com',
      role: 'EMPLOYEE'
    },
    {
      userId: 3,
      username: '管理者',
      email: 'admin@example.com',
      role: 'ADMIN'
    },
    {
      userId: 4,
      username: '鈴木一郎',
      email: 'suzuki@example.com',
      role: 'EMPLOYEE'
    },
    {
      userId: 5,
      username: '田中美咲',
      email: 'tanaka@example.com',
      role: 'EMPLOYEE'
    }
  ];

  private nextUserId = 6;

  /**
   * すべてのユーザーを取得
   */
  getAllUsers(): Observable<User[]> {
    return of([...this.users]).pipe(delay(200));
  }

  /**
   * ユーザーIDでユーザーを取得
   */
  getUserById(userId: number): Observable<User | undefined> {
    const user = this.users.find(u => u.userId === userId);
    return of(user).pipe(delay(150));
  }

  /**
   * ユーザー名でユーザーを検索
   */
  getUserByUsername(username: string): Observable<User | undefined> {
    const user = this.users.find(u => u.username === username);
    return of(user).pipe(delay(150));
  }

  /**
   * 新しいユーザーを作成
   */
  createUser(user: User): Observable<User> {
    const newUser: User = {
      userId: this.nextUserId++,
      username: user.username,
      email: user.email,
      role: user.role
    };
    this.users.push(newUser);
    return of(newUser).pipe(delay(300));
  }

  /**
   * ユーザー情報を更新
   */
  updateUser(userId: number, updates: Partial<User>): Observable<User | null> {
    const userIndex = this.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      return of(null).pipe(delay(200));
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    return of(this.users[userIndex]).pipe(delay(300));
  }

  /**
   * ユーザーを削除
   */
  deleteUser(userId: number): Observable<void> {
    const userIndex = this.users.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      return of(undefined).pipe(delay(200));
    }

    this.users.splice(userIndex, 1);
    return of(undefined).pipe(delay(300));
  }

  /**
   * 従業員ユーザーのみを取得
   */
  getEmployees(): Observable<User[]> {
    const employees = this.users.filter(u => u.role === 'EMPLOYEE');
    return of(employees).pipe(delay(200));
  }

  /**
   * 管理者ユーザーのみを取得
   */
  getAdmins(): Observable<User[]> {
    const admins = this.users.filter(u => u.role === 'ADMIN');
    return of(admins).pipe(delay(200));
  }

  /**
   * デバッグ用: ユーザーをリセット
   */
  resetUsers(): void {
    this.users = [
      { userId: 1, username: '山田太郎', email: 'yamada@example.com', role: 'EMPLOYEE' },
      { userId: 2, username: '佐藤花子', email: 'sato@example.com', role: 'EMPLOYEE' },
      { userId: 3, username: '管理者', email: 'admin@example.com', role: 'ADMIN' },
      { userId: 4, username: '鈴木一郎', email: 'suzuki@example.com', role: 'EMPLOYEE' },
      { userId: 5, username: '田中美咲', email: 'tanaka@example.com', role: 'EMPLOYEE' }
    ];
    this.nextUserId = 6;
  }
}
