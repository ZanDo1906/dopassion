import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { Staff } from '../../services/staff';
import { iStaff } from '../../interfaces/staff';
@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  errorMessage = '';
  showForgotModal = false;
  forgotStep = 1;
  forgotValue = '';
  forgotError = '';
  generatedOtp = '';
  otpInput = '';
  newPassword = '';
  confirmPassword = '';
  forgotUser: any = null;

  constructor(private router: Router, private staffService: Staff) { }

  submit() {

  this.errorMessage = '';

  const usernameTrim =
    this.username.trim();

  const passwordTrim =
    this.password.trim();

  // CHECK RỖNG
  if (!usernameTrim || !passwordTrim) {

    this.errorMessage =
      'Vui lòng nhập đầy đủ thông tin';

    return;
  }

  // CALL API
  this.staffService.getStaff().subscribe({

    next: (staffList: iStaff[]) => {

      console.log('STAFF LIST', staffList);

      // TÌM USER
      const user = staffList.find(

        (staff: any) =>

          String(staff.maNv)
            .trim()
            .toLowerCase()

          ===

          usernameTrim.toLowerCase()

      );

      console.log('USER FOUND', user);

      // KHÔNG TÌM THẤY
      if (!user) {

        this.errorMessage =
          'Sai mã nhân viên';

        return;
      }

      // CHECK PASSWORD
        const dbPassword =
          String(user.password || '').trim();
        if (passwordTrim !== dbPassword) {
          this.errorMessage =
            'Sai mật khẩu';
          return;
        }

      // LƯU USER
      localStorage.setItem(
        'currentStaff',
        JSON.stringify(user)
      );

      // CHUYỂN TRANG
      this.router.navigate([  '/report/student-report']);
    },

    error: (error) => {

      console.error(error);

      this.errorMessage =
        'Không thể kết nối server';

    }

  });

}

  private normalizeStaffId(value: string): string {
    const normalized = value.toUpperCase().trim();
    if (/^DPS\d{5}$/.test(normalized)) {
      return normalized;
    }

    const digits = normalized.replace(/\D/g, '');
    return digits.length === 5 ? `DPS${digits}` : normalized;
  }


  openForgotPassword(): void {

    this.showForgotModal = true;

    this.forgotStep = 1;

    this.forgotError = '';

    this.forgotValue = '';

    this.otpInput = '';

    this.newPassword = '';

    this.confirmPassword = '';
  }

  closeForgotPassword(): void {

    this.showForgotModal = false;
  }

  sendOtp(): void {

    this.forgotError = '';

    const value = this.forgotValue.trim();

    if (!value) {

      this.forgotError = 'Vui lòng nhập email hoặc SĐT';

      return;
    }

    this.staffService.getStaff().subscribe({

      next: (staffList: iStaff[]) => {

        const user = staffList.find((staff: any) => {

          const phone =
            String(staff.sdt || '').trim();

          const email =
            String(staff.email || '').trim().toLowerCase();

          return (
            phone === value ||
            email === value.toLowerCase()
          );
        });

        if (!user) {

          this.forgotError =
            'Không tìm thấy tài khoản';

          return;
        }

        this.forgotUser = user;

        // RANDOM OTP
        this.generatedOtp =
          Math.floor(
            100000 + Math.random() * 900000
          ).toString();

        this.forgotStep = 2;
      },

      error: () => {

        this.forgotError =
          'Không thể kiểm tra dữ liệu';
      }
    });
  }

  verifyOtp(): void {

    this.forgotError = '';

    if (this.otpInput !== this.generatedOtp) {

      this.forgotError =
        'OTP không chính xác';

      return;
    }

    this.forgotStep = 3;
  }

  resetPassword(): void {

    this.forgotError = '';

    if (
      !this.newPassword ||
      !this.confirmPassword
    ) {

      this.forgotError =
        'Vui lòng nhập đầy đủ mật khẩu';

      return;
    }

    if (this.newPassword.length < 6) {

      this.forgotError =
        'Mật khẩu phải từ 6 ký tự';

      return;
    }

    if (
      this.newPassword !==
      this.confirmPassword
    ) {

      this.forgotError =
        'Xác nhận mật khẩu không khớp';

      return;
    }

    // LƯU PASSWORD MỚI
    localStorage.setItem(
      `password_${this.forgotUser.maNv}`,
      this.newPassword
    );

    alert('Đổi mật khẩu thành công');

    this.closeForgotPassword();
  }
}

