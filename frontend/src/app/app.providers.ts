import { Provider } from '@angular/core';
import { environment } from '../environments/environment';
import { AttendanceService } from './services/attendance.service';
import { AttendanceServiceMock } from './services/attendance.service.mock';
import { UserService } from './services/user.service';
import { UserServiceMock } from './services/user.service.mock';

/**
 * モックサービスまたは実際のサービスを提供
 */
export function getAppProviders(): Provider[] {
  if (environment.useMockServices) {
    return [
      { provide: AttendanceService, useClass: AttendanceServiceMock },
      { provide: UserService, useClass: UserServiceMock }
    ];
  } else {
    return [
      AttendanceService,
      UserService
    ];
  }
}
