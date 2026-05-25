import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration';
import { Class } from '../../services/class';
import { Payment } from '../../services/payment';
interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isHoliday: boolean;
  holidayName?: string;
  hasEvent: boolean;
}

interface Holiday {
  month: number;
  date: number;
  name: string;
  blessing: string;
}

interface ClassDetail {
  id: number;
  name: string;
  code: string;
  instructor: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  branch: string;
  room: string;
  schedule: string;
  startTime: string;
  endTime: string;
}

// KHAI BÁO INTERFACE THANH TOÁN
interface PaymentDetail {
  id: number;
  className: string;
  paymentCode: string;
  amountBeforeVoucher: number;
  voucher: string;
  amountAfterVoucher: number;
  amountPaid: number;
  refundAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'postponed';
  paymentDate: string;
  note: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
constructor(
  private router: Router,
  private registrationService: RegistrationService,
  private classService: Class,
  private paymentService: Payment
) {}
  currentView: 'info' | 'classes' | 'payment' | 'schedule' = 'info';
  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  customerCode: string = '';
  dateOfBirth: string = '';
  joinDate: string = '';
  showPasswordForm: boolean = false;
  showLogoutPopup: boolean = false;

  // PROFILE EDIT
isEditingProfile: boolean = false;
isChangingPassword: boolean = false;

avatarPreview: string | null = null;

  // BIẾN QUẢN LÝ BỘ LỌC
  classFilter: 'all' | 'upcoming' | 'ongoing' | 'completed' = 'all';
  paymentFilter: 'all' | 'pending' | 'completed' | 'postponed' = 'all';

  // Calendar properties
  selectedYear: number = 2025;
  selectedMonth: number = 12;
  calendarDays: CalendarDay[] = [];
  calendarTitle: string = '';
  
  // Popup properties
  showHolidayPopup: boolean = false;
  selectedHoliday: Holiday | null = null;
  
  // Class Detail Popup properties
  showClassPopup: boolean = false;
  selectedClass: ClassDetail | null = null;

  // Payment Detail Popup properties
  showPaymentPopup: boolean = false;
  selectedPayment: PaymentDetail | null = null;

  // Mock payment data
  payments: PaymentDetail[] = [];

  // HÀM XỬ LÝ LỌC DỮ LIỆU
  get filteredClasses() {
    if (this.classFilter === 'all') return this.classes;
    return this.classes.filter(c => c.status === this.classFilter);
  }

  get filteredPayments() {
    if (this.paymentFilter === 'all') return this.payments;
    return this.payments.filter(p => p.status === this.paymentFilter);
  }

  
  // Mock class data
  classes: ClassDetail[] = [];
  switchView(view: 'info' | 'classes' | 'payment' | 'schedule') {

  this.currentView = view;

  // LOAD LẠI DANH SÁCH LỚP
  if (view === 'classes') {

    this.loadRegisteredClasses(this.customerCode);

  }

}

  ngOnInit() {

  // LẤY USER LOGIN
  const userData = localStorage.getItem('currentUser');

  if (!userData) {

    this.router.navigate(['/login']);

    return;
  }

  const user = JSON.parse(userData);

  console.log('USER LOGIN:', user);


  // FILL PROFILE
this.fullName =
  user.tenKhachHang ||
  user.fullName ||
  '';

this.phoneNumber =
  user.soDienThoai ||
  user.sdt ||
  user.phone ||
  '';

this.email = user.email || '';

this.customerCode =
  user.maKh ||
  user.maKhachHang ||
  '';
  console.log('CUSTOMER CODE:', this.customerCode);
// LOAD LỚP HỌC ĐÃ ĐĂNG KÝ
this.loadRegisteredClasses(this.customerCode);

this.loadPayments(this.customerCode);

// FIX NGÀY SINH
if (user.ngaySinh) {

  const ngaySinh = new Date(user.ngaySinh);

  this.dateOfBirth =
    `${ngaySinh.getUTCFullYear()}-` +
    `${String(ngaySinh.getUTCMonth() + 1).padStart(2, '0')}-` +
    `${String(ngaySinh.getUTCDate()).padStart(2, '0')}`;

}


// FIX NGÀY THAM GIA
if (user.ngayDangKy) {

  const ngayDangKy = new Date(user.ngayDangKy);

  const month = ngayDangKy.getUTCMonth() + 1;
  const year = ngayDangKy.getUTCFullYear();

  this.joinDate = `tháng ${month} năm ${year}`;
}
  }
  loadRegisteredClasses(maKh: string) {

  this.registrationService.getRegistrations().subscribe({

    next: (registrations) => {

      console.log('ALL REGISTRATIONS:', registrations);

      // lọc đăng ký theo khách hàng
      const myRegistrations = registrations.filter(

        r => r.maKh === maKh

      );

      console.log('MY REGISTRATIONS:', myRegistrations);

      // lấy toàn bộ lớp học
      this.classService.getClasses().subscribe({

        next: (classList) => {

          console.log('ALL CLASSES:', classList);

          this.classes = myRegistrations.map((item, index) => {

            // tìm class theo maLop
            const classInfo = classList.find(

              c => c.maLop === item.maLop

            );

            return {

              id: index + 1,

              name:
                classInfo?.tenLop ||
                item.tenLopHoc ||
                'Chưa có tên lớp',

              code: item.maLop || '',

              instructor:
                classInfo?.giangVien ||
                'Chưa cập nhật',

              startDate:
                classInfo?.ngayBatDau
                  ? new Date(classInfo.ngayBatDau)
                      .toLocaleDateString('vi-VN')
                  : '',

              endDate:
                classInfo?.ngayKetThuc
                  ? new Date(classInfo.ngayKetThuc)
                      .toLocaleDateString('vi-VN')
                  : '',

              status: 'ongoing',

              branch:
                classInfo?.chiNhanh ||
                item.chiNhanh ||
                'Chưa cập nhật',

              room: 'Chưa cập nhật',

              schedule:
                classInfo?.khungGio ||
                'Chưa cập nhật',

              startTime: '--:--',

              endTime: '--:--'

            };

          });

          console.log('FINAL CLASSES:', this.classes);

        },

        error: (err) => {

          console.error('Lỗi load class:', err);

        }

      });

    },

    error: (err) => {

      console.error('Lỗi load registration:', err);

    }

  });

}
loadPayments(maKhachHang: string) {

  this.paymentService.getPayments().subscribe({

    next: (data: any[]) => {

      console.log('ALL PAYMENTS:', data);

      const myPayments = data.filter(

        p => p.maKh === maKhachHang

      );

      this.payments = myPayments.map((item, index) => {

        return {

          id: index + 1,

          className: item.tenLopHoc || '',

          paymentCode: item.maDangKy || '',

          amountBeforeVoucher: item.hocPhi || 0,

          voucher: item.voucher || '',

          amountAfterVoucher: item.soTienCanThanhToan || 0,

          amountPaid:
            (item.soTienCanThanhToan || 0)
            - (item.soTienConLai || 0),

          refundAmount: 0,

          paymentMethod: 'Chưa cập nhật',

          status:
            item.trangThaiThanhToan === 'Đã thanh toán'
              ? 'completed'
              : 'pending',

          paymentDate: item.ngayDangKy
            ? new Date(item.ngayDangKy).toLocaleDateString('vi-VN')
            : '',

          note: ''

        };

      });

      console.log('MY PAYMENTS:', this.payments);

    },

    error: (err) => {

      console.error('Lỗi load payment:', err);

    }

  });

}

  openClassPopup(classItem: ClassDetail) {
    this.selectedClass = classItem;
    this.showClassPopup = true;
  }

  closeClassPopup() {
    this.showClassPopup = false;
    this.selectedClass = null;
  }

  openPaymentPopup(payment: PaymentDetail) {
    this.selectedPayment = payment;
    this.showPaymentPopup = true;
  }

  closePaymentPopup() {
    this.showPaymentPopup = false;
    this.selectedPayment = null;
  }
  toggleEditProfile() {

  if (this.isEditingProfile) {

    // SAVE API
    console.log('Đã lưu thông tin');

  }

  this.isEditingProfile = !this.isEditingProfile;
}
  toggleChangePassword() {

  if (this.isChangingPassword) {

    // SAVE PASSWORD API
    console.log('Đã đổi mật khẩu');

  }

  this.isChangingPassword = !this.isChangingPassword;
}

onAvatarChange(event: any) {

  const file = event.target.files[0];

  if (!file) return;

  // check file ảnh
  if (!file.type.startsWith('image/')) {

    alert('Vui lòng chọn file ảnh');

    return;
  }

  const reader = new FileReader();

  reader.onload = () => {

    this.avatarPreview = reader.result as string;
    this.isEditingProfile = true;

  };

  reader.readAsDataURL(file);
}
openLogoutPopup() {

  this.showLogoutPopup = true;

}

closeLogoutPopup() {

  this.showLogoutPopup = false;

}

logout() {

  localStorage.removeItem('currentUser');

  this.router.navigate(['/login']);

}

}

