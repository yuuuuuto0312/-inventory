import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: [''],
      password: ['']
    });
  }

onSubmit() {
  console.log('送信データ:', this.form.value);

  const { email, password } = this.form.value;

  this.authService.login(email, password).subscribe({
    next: (res) => {
      console.log('ログイン成功！ロール:', res.role); // ← ここで確認
      this.authService.setRole(res.role);
      this.router.navigate(['/inventory']);
    },
    error: () => {
      console.error('ログイン失敗');
      alert('ログインに失敗しました');
    }
  });
}
}