import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

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

  constructor(private router: Router) {}

  submit() {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ mã nhân viên và mật khẩu.';
      return;
    }

    // Logic đăng nhập cơ bản: chuyển tới báo cáo khi đã nhập thông tin
    this.router.navigate(['/report/student-report']);
  }
}

