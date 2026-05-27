import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Customer } from '../../services/customer';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  loginValue: string = '';
  password: string = '';
  isRegisterMode: boolean = false;
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // Remember login
  rememberMe: boolean = false;

  // Register fields
  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  gender: string = 'Nam';
  dob: string = '';

  // Forgot password modal state
  showForgotModal: boolean = false;
  forgotStep: number = 1;
  forgotValue: string = '';
  otpInput: string = '';
  generatedOtp: string = '';
  newPasswordForgot: string = '';
  confirmPasswordForgot: string = '';
  forgotCustomerId: string = '';
  showForgotPass: boolean = false;
  showForgotConfirmPass: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private customerService: Customer,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      this.loginValue = savedUser;
      this.rememberMe = true;
    }
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  onLogin() {
    // CHECK RỖNG
    if (!this.loginValue || !this.password) {
      this.notification.show('Lỗi đăng nhập', 'Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    // CALL API
    this.customerService.login(this.loginValue, this.password).subscribe({
      next: (res) => {
        if (res.success && res.customer) {
          // Ghi nhớ đăng nhập
          if (this.rememberMe) {
            localStorage.setItem('rememberedUser', this.loginValue);
          } else {
            localStorage.removeItem('rememberedUser');
          }

          // LƯU LOCALSTORAGE
          localStorage.setItem(
            'currentUser',
            JSON.stringify(res.customer)
          );

          this.notification.show('Thành công', 'Đăng nhập thành công!', 'success');

          // NAVIGATE
          const returnToClass = this.route.snapshot.queryParamMap.get('returnToClass');
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          if (returnToClass) {
            this.router.navigate(['/classes'], { queryParams: { autoRegister: returnToClass } });
          } else if (returnUrl) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate(['/account']);
          }
        } else {
          this.notification.show('Lỗi đăng nhập', res.message || 'Đăng nhập thất bại.', 'error');
        }
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.';
        this.notification.show('Lỗi', errorMsg, 'error');
      }
    });
  }

  onRegister() {
    // CHECK RỖNG
    if (
      !this.fullName ||
      !this.phoneNumber ||
      !this.email ||
      !this.password ||
      !this.confirmPassword ||
      !this.gender ||
      !this.dob
    ) {
      this.notification.show('Lỗi đăng ký', 'Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    // CHECK PASSWORD
    if (this.password !== this.confirmPassword) {
      this.notification.show('Lỗi đăng ký', 'Mật khẩu xác nhận không khớp.', 'error');
      return;
    }

    // CALL API REGISTER
    const registrationData = {
      tenKhachHang: this.fullName,
      sdt: this.phoneNumber,
      email: this.email,
      matKhau: this.password,
      gioiTinh: this.gender,
      ngaySinh: this.dob
    };

    this.customerService.register(registrationData).subscribe({
      next: (res) => {
        this.notification.show('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');

        // Reset inputs
        this.fullName = '';
        this.phoneNumber = '';
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
        this.gender = 'Nam';
        this.dob = '';
        this.loginValue = res.email || '';

        // QUAY VỀ LOGIN
        this.isRegisterMode = false;
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        this.notification.show('Lỗi đăng ký', errorMsg, 'error');
      }
    });
  }

  // Forgot Password flow
  openForgotPassword() {
    this.showForgotModal = true;
    this.forgotStep = 1;
    this.forgotValue = '';
    this.otpInput = '';
    this.newPasswordForgot = '';
    this.confirmPasswordForgot = '';
    this.forgotCustomerId = '';
    this.showForgotPass = false;
    this.showForgotConfirmPass = false;
  }

  closeForgotPassword() {
    this.showForgotModal = false;
  }

  sendOtp() {
    const value = this.forgotValue.trim();
    if (!value) {
      this.notification.show('Lỗi', 'Vui lòng nhập email hoặc số điện thoại.', 'warning');
      return;
    }

    this.customerService.verifyAccount(value).subscribe({
      next: (res) => {
        if (res.success) {
          this.forgotCustomerId = res.customerId;
          // Generate 6 digit OTP
          this.generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Mock send OTP notification
          this.notification.show('Mã xác nhận', `Mã OTP của bạn là: ${this.generatedOtp}`, 'info');
          
          this.forgotStep = 2;
        }
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Không tìm thấy tài khoản tương ứng trên hệ thống.';
        this.notification.show('Lỗi', errorMsg, 'error');
      }
    });
  }

  verifyOtp() {
    const otp = this.otpInput.trim();
    if (!otp) {
      this.notification.show('Lỗi', 'Vui lòng nhập mã OTP.', 'warning');
      return;
    }

    if (otp === this.generatedOtp) {
      this.forgotStep = 3;
    } else {
      this.notification.show('Lỗi', 'Mã OTP không chính xác. Vui lòng thử lại.', 'error');
    }
  }

  resetPassword() {
    if (!this.newPasswordForgot || !this.confirmPasswordForgot) {
      this.notification.show('Lỗi', 'Vui lòng điền đầy đủ mật khẩu mới.', 'warning');
      return;
    }

    if (this.newPasswordForgot !== this.confirmPasswordForgot) {
      this.notification.show('Lỗi', 'Mật khẩu xác nhận không khớp.', 'error');
      return;
    }

    if (this.newPasswordForgot.length < 6) {
      this.notification.show('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự.', 'warning');
      return;
    }

    this.customerService.resetPassword(this.forgotCustomerId, this.newPasswordForgot).subscribe({
      next: (res) => {
        if (res.success) {
          this.notification.show('Thành công', 'Đổi mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.', 'success');
          this.closeForgotPassword();
        }
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
        this.notification.show('Lỗi', errorMsg, 'error');
      }
    });
  }
}