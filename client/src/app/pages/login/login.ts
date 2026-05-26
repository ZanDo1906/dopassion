import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Client } from '../../services/client';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginValue: string = '';
  password: string = '';
  isRegisterMode: boolean = false;
  confirmPassword: string = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clientService: Client,
    private notification: NotificationService
  ) {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  onLogin() {

    // CHECK RỖNG
    if (!this.loginValue || !this.password) {
      this.notification.show('Lỗi đăng nhập', 'Vui lòng nhập đầy đủ thông tin.', 'warning');
      return;
    }

    // PASSWORD MẶC ĐỊNH
    if (this.password !== '123456789') {
      this.notification.show('Lỗi đăng nhập', 'Sai mật khẩu.', 'error');
      return;
    }

    // CALL API
    this.clientService.getClients().subscribe({

      next: (clients: any[]) => {

        // TÌM USER
        const user = clients.find(client =>

          client.email === this.loginValue ||
          client.soDienThoai?.toString() === this.loginValue

        );

        // KHÔNG TÌM THẤY
        if (!user) {
          this.notification.show('Lỗi đăng nhập', 'Email hoặc số điện thoại không tồn tại.', 'error');
          return;
        }

        // LƯU LOCALSTORAGE
        localStorage.setItem(
          'currentUser',
          JSON.stringify(user)
        );

        this.notification.show('Thành công', 'Đăng nhập thành công!', 'success');

        // NAVIGATE
        const returnToClass = this.route.snapshot.queryParamMap.get('returnToClass');
        if (returnToClass) {
          this.router.navigate(['/classes'], { queryParams: { autoRegister: returnToClass } });
        } else {
          this.router.navigate(['/account']);
        }

      },

      error: (err) => {
        console.error(err);
        this.notification.show('Lỗi', 'Lỗi kết nối máy chủ. Vui lòng thử lại sau.', 'error');
      }

    });

  }

onRegister() {

  // CHECK RỖNG
  if (
    !this.loginValue ||
    !this.password ||
    !this.confirmPassword
  ) {
    this.notification.show('Lỗi đăng ký', 'Vui lòng nhập đầy đủ thông tin.', 'warning');
    return;
  }

  // CHECK PASSWORD
  if (this.password !== this.confirmPassword) {
    this.notification.show('Lỗi đăng ký', 'Mật khẩu xác nhận không khớp.', 'error');
    return;
  }

  this.notification.show('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', 'success');

  // RESET
  this.loginValue = '';
  this.password = '';
  this.confirmPassword = '';

  // QUAY VỀ LOGIN
  this.isRegisterMode = false;

}
}