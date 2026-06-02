import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Staff } from '../../services/staff';
import { environment } from '../../../environments/environments';
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  constructor(
    private staffService: Staff
  ) { }

  _id: string = '';
  isEditMode: boolean = false;
  tenNhanVien: string = '';
  sdt: string = '';
  email: string = '';
  ngaySinh: string = '';
  updatedAt: string = '';
  avatar: string = environment.apiUrl + '/uploads/avatar-admin/default-avatar.png';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  showPasswordForm: boolean = false;

  ngOnInit(): void {

    // LẤY USER ĐANG LOGIN
    const currentUser =
      localStorage.getItem('currentStaff');

    if (currentUser) {

      const user = JSON.parse(currentUser);
      this._id = user._id;
      this.tenNhanVien =
        user.tenNhanVien || '';

      this.sdt =
        user.sdt || '';

      this.email =
        user.email || '';

      // FORMAT DATE
      if (user.ngaySinh) {

        this.ngaySinh =
          new Date(user.ngaySinh)
            .toISOString()
            .split('T')[0];

      }

      // AVATAR
      if (user.anhCccd) {
        this.avatar = user.anhCccd.startsWith('http') ? user.anhCccd : environment.apiUrl + user.anhCccd;
      }
      // NGÀY CẬP NHẬP
      if (user.updatedAt) {

        const date =
          new Date(user.updatedAt);

        this.updatedAt =
          `Cập nhật lần cuối: ${date.getDate()
          }/${date.getMonth() + 1
          }/${date.getFullYear()
          }`;

      }

    }

  }
  enableEdit(): void {

    this.isEditMode = true;

  }

  saveProfile(): void {

    const updatedData = {

      tenNhanVien: this.tenNhanVien,

      sdt: Number(this.sdt),

      email: this.email,

      ngaySinh: this.ngaySinh

    };

    this.staffService
      .updateStaff(this._id, updatedData as any)
      .subscribe({

        next: (response) => {

          localStorage.setItem(
            'currentStaff',
            JSON.stringify(response)
          );

          alert('Cập nhật thành công');

          this.isEditMode = false;

        },

        error: (error) => {

          console.error(error);

          alert('Cập nhật thất bại');

        }

      });

  }
  changePassword(): void {
    this.passwordError = '';
    // CHECK RỖNG
    if (
      !this.oldPassword ||
      !this.newPassword ||
      !this.confirmPassword
    ) {
      this.passwordError =
        'Vui lòng nhập đầy đủ thông tin';

      return;
    }
    // CHECK ĐỘ DÀI
    if (this.newPassword.length < 6) {
      this.passwordError =
        'Mật khẩu mới phải từ 6 ký tự';

      return;
    }
    // CHECK XÁC NHẬN
    if (
      this.newPassword !==
      this.confirmPassword
    ) {
      this.passwordError =
        'Xác nhận mật khẩu không khớp';
      return;
    }
    // LẤY USER MỚI NHẤT TỪ DB
    this.staffService
      .getStaff()
      .subscribe({
        next: (staffList: any[]) => {
          const currentUser =
            staffList.find(
              staff => staff._id === this._id
            );
          if (!currentUser) {
            this.passwordError =
              'Không tìm thấy tài khoản';
            return;
          }
          // CHECK PASSWORD CŨ
          if (
            currentUser.password !==
            this.oldPassword
          ) {
            this.passwordError =
              'Mật khẩu hiện tại không đúng';
            return;
          }
          // UPDATE PASSWORD
          this.staffService
            .updateStaff(
              this._id,
              {
                password: this.newPassword
              }
            )
            .subscribe({
              next: (response) => {
                // UPDATE LOCAL
                localStorage.setItem(
                  'currentStaff',
                  JSON.stringify({
                    ...currentUser,
                    password:
                      this.newPassword
                  })
                );
                alert(
                  'Đổi mật khẩu thành công'
                );
                // RESET FORM
                this.oldPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
                this.passwordError = '';
                this.showPasswordForm = false;
              },
              error: (error) => {
                console.error(error);
                this.passwordError =
                  'Không thể cập nhật mật khẩu';
              }
            });
        },
        error: (error) => {
          console.error(error);
          this.passwordError =
            'Không thể kiểm tra dữ liệu';
        }
      });
  }
}