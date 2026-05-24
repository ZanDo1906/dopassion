import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Staff } from '../../services/staff';
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
) {}

  _id: string = '';

  isEditMode: boolean = false;

  tenNhanVien: string = '';

  sdt: string = '';

  email: string = '';

  ngaySinh: string = '';

  updatedAt: string = '';

  avatar: string = '/avatar.jpg';

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
      if (user.anhCccd) { this.avatar = user.anhCccd;}
      // NGÀY CẬP NHẬP
      if (user.updatedAt) {

        const date =
          new Date(user.updatedAt);

        this.updatedAt =
          `Cập nhật lần cuối: ${
            date.getDate()
          }/${
            date.getMonth() + 1
          }/${
            date.getFullYear() 
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
}