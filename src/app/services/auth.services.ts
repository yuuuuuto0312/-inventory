import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role: string = '';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<any>('/api/auth/login', { email, password });
  }

  setRole(role: string) {
    this.role = role;
  }

  getRole() {
    return this.role;
  }
}