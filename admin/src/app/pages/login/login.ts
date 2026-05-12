import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { Staff } from '../../services/staff';
import { iStaff } from '../../interfaces/staff';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';

  constructor(private router: Router, private staffService: Staff) {}

  submit() {
    this.errorMessage = '';

    const usernameTrim = this.username.trim();
    const passwordTrim = this.password.trim();

    if (!usernameTrim || !passwordTrim) {
      this.errorMessage = 'Vui lòng nhập đầy đủ mã nhân viên và mật khẩu.';
      return;
    }

    const userId = this.normalizeStaffId(usernameTrim);
    console.log('Login attempt', { userId, passwordTrim });
    this.staffService.getStaff().subscribe(
      (staffList: iStaff[]) => {
        console.log('Staff list loaded', staffList.length);
        const user = staffList.find(
          (staff) => String(staff['Mã NV']).toUpperCase() === userId
        );
        if (!user) {
          console.log('User not found for', userId);
          this.errorMessage = 'Sai tên đăng nhập.';
          return;
        }

        if (user.password !== passwordTrim) {
          console.log('Wrong password for', userId, 'expected', user.password);
          this.errorMessage = 'Sai mật khẩu.';
          return;
        }

        this.router.navigate(['/report/student-report']);
      },
      (error) => {
        console.error('Failed loading staff.json', error);
        this.errorMessage = 'Không thể kiểm tra đăng nhập. Vui lòng thử lại.';
      }
    );
  }

  private normalizeStaffId(value: string): string {
    const normalized = value.toUpperCase().trim();
    if (/^DPS\d{5}$/.test(normalized)) {
      return normalized;
    }

    const digits = normalized.replace(/\D/g, '');
    return digits.length === 5 ? `DPS${digits}` : normalized;
  }
}

