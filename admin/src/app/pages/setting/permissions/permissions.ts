import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../services/role';
import { iRole } from '../../../interfaces/role';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    FormsModule
  ],
  templateUrl: './permissions.html',
  styleUrl: './permissions.css'
})

export class Permissions implements OnInit {

  roles: iRole[] = [];

  selectedRole = '';

  searchedRole: iRole | null = null;

  permissionModules = [

{
module:'Báo cáo học viên',
permissions:{
xuatExcel:true,
xemChiTiet:true
}
},

{
module:'Báo cáo công nợ',
permissions:{
xuatExcel:true,
xemChiTiet:true
}
},

{
module:'Báo cáo doanh thu',
permissions:{
xuatExcel:true,
xemChiTiet:true
}
},

{
module:'Vai trò',
permissions:{
themMoi:true,
xemChiTiet:true,
chinhSua:true,
an:true
}
},

{
module:'Nhân viên',
permissions:{
themMoi:true,
nhapExcel:true,
xuatExcel:true,
xemChiTiet:true,
chinhSua:true,
an:true,
khoaTaiKhoan:true
}
},

{
module:'Danh sách khách hàng',
permissions:{
themMoi:true,
nhapExcel:true,
xuatExcel:true,
xemChiTiet:true,
chinhSua:true,
an:true,
khoaTaiKhoan:true
}
},

{
module:'Danh sách đăng ký',
permissions:{
xemChiTiet:true,
chinhSua:true,
thanhToan:true,
hoanTien:true
}
},

{
module:'Khóa học',
permissions:{
themMoi:true,
nhapExcel:true,
xuatExcel:true,
xemChiTiet:true,
chinhSua:true,
an:true
}
},

{
module:'Lớp học',
permissions:{
themMoi:true,
nhapExcel:true,
xuatExcel:true,
xemChiTiet:true,
chinhSua:true,
an:true
}
},

{
module:'Yêu cầu',
permissions:{
xemChiTiet:true,
chinhSua:true
}
},

{
module:'Phản hồi',
permissions:{
xemChiTiet:true,
chinhSua:true
}
},

{
module:'Hoàn tiền',
permissions:{
xemChiTiet:true,
chinhSua:true,
hoanTien:true
}
},

{
module:'Công nợ',
permissions:{
xemChiTiet:true,
xuatExcel:true
}
},

{
module:'Voucher',
permissions:{
themMoi:true,
xemChiTiet:true,
chinhSua:true,
an:true
}
},

{
module:'Cấu hình',
permissions:{
chinhSua:true
}
},

{
module:'Phân quyền',
permissions:{
xemChiTiet:true,
chinhSua:true
}
}

];

  constructor(
    private roleService: RoleService
  ) { }

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getRole().subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Lỗi load role:', err);
      }
    });
  }

  handleSearch(): void {

    if (!this.selectedRole) {
      this.searchedRole = null;
      return;
    }

    this.searchedRole =
      this.roles.find(
        role => role.maVaiTro === this.selectedRole
      ) || null;
  }

  savePermissions(): void {
    console.log('Permission Data:', {
      role: this.searchedRole,
      permissions: this.permissionModules
    });
  }

}