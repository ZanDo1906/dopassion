import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Client } from '../../services/client';

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
    private clientService: Client
  ) {}

  onLogin() {

    // CHECK RỖNG
    if (!this.loginValue || !this.password) {

      alert('Vui lòng nhập đầy đủ thông tin');

      return;
    }

    // PASSWORD MẶC ĐỊNH
    if (this.password !== '123456789') {

      alert('Sai mật khẩu');

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

          alert('Email hoặc số điện thoại không tồn tại');

          return;
        }

        // LƯU LOCALSTORAGE
        localStorage.setItem(
          'currentUser',
          JSON.stringify(user)
        );

        alert('Đăng nhập thành công');

        // NAVIGATE
        this.router.navigate(['/account']);

      },

      error: (err) => {

        console.error(err);

        alert('Lỗi server');

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

    alert('Vui lòng nhập đầy đủ thông tin');

    return;

  }

  // CHECK PASSWORD
  if (this.password !== this.confirmPassword) {

    alert('Mật khẩu xác nhận không khớp');

    return;

  }

  alert('Đăng ký thành công');

  // RESET
  this.loginValue = '';
  this.password = '';
  this.confirmPassword = '';

  // QUAY VỀ LOGIN
  this.isRegisterMode = false;

}
}