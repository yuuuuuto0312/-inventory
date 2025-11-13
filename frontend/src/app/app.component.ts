import { Component } from '@angular/core';
import { AdminComponent } from './components/admin/admin.component';
import { AttendanceComponent } from './components/attendance/attendance.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    AttendanceComponent,
    AdminComponent
  ],
  template: `
    <div class="container">
      <h1>勤怠管理システム</h1>
      <app-attendance></app-attendance>
      <app-admin></app-admin>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = '勤怠管理システム';
}
