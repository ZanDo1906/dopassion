import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration';
import { Class } from '../../services/class';
import { Payment } from '../../services/payment';
import { NotificationService } from '../../services/notification.service';
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
  status: 'pending' | 'completed' | 'postponed' | 'cancelled';
  paymentDate: string;
  paymentDateTime: string;
  updatedDateTime: string;
  note: string;
  rawPayment?: any;
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
  private paymentService: Payment,
  private notification: NotificationService
) {
  this.currentDate = new Date();
}
  currentView: 'info' | 'classes' | 'payment' | 'schedule' = 'info';
  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  customerCode: string = '';
  dateOfBirth: string = '';
  joinDate: string = '';
  showPasswordForm: boolean = false;
  showLogoutPopup: boolean = false;
  currentDate: Date;

  // PROFILE EDIT
isEditingProfile: boolean = false;
isChangingPassword: boolean = false;

avatarPreview: string | null = null;
isUploading: boolean = false;
selectedFile: File | null = null;

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
  remainingTime: string = '';
  timerInterval: any;

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

      // Lọc đăng ký theo khách hàng và trạng thái đang hoạt động, đảo ngược mảng để cái mới nhất lên trên
      const myRegistrations = registrations.filter(
        r => r.maKh === maKh && r.trangThai === 'Đang hoạt động'
      ).reverse();

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
      ).reverse();

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

          status: (() => {
            if (item.trangThaiThanhToan === 'Đã thanh toán') return 'completed';
            if (item.trangThaiThanhToan === 'Đã hủy') return 'cancelled';
            
            // Check 10 minutes expiry
            if (item.ngayDangKy) {
              const diffMs = new Date().getTime() - new Date(item.ngayDangKy).getTime();
              const diffMins = diffMs / 60000;
              if (diffMins > 10) {
                // Should be cancelled if not already paid and > 10 mins
                this.cancelExpiredPaymentAndRegistration(item);
                return 'cancelled';
              }
            }
            return 'pending';
          })(),

          paymentDate: item.ngayDangKy
            ? new Date(item.ngayDangKy).toLocaleDateString('vi-VN')
            : '',
          
          paymentDateTime: item.ngayDangKy
            ? (() => {
                const d = new Date(item.ngayDangKy);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              })()
            : '',

          updatedDateTime: item.updatedAt || item.ngayDangKy
            ? (() => {
                const d = new Date(item.updatedAt || item.ngayDangKy);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              })()
            : '',

          note: '',
          rawPayment: item
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
    this.startTimer();
  }

  closePaymentPopup() {
    this.showPaymentPopup = false;
    this.selectedPayment = null;
    this.copiedField = null;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.selectedPayment && this.selectedPayment.status === 'pending' && this.selectedPayment.rawPayment?.ngayDangKy) {
      const createdTime = new Date(this.selectedPayment.rawPayment.ngayDangKy).getTime();
      const expiryTime = createdTime + 10 * 60000;
      
      this.updateTimer(expiryTime);
      this.timerInterval = setInterval(() => {
        this.updateTimer(expiryTime);
      }, 1000);
    } else {
      this.remainingTime = '';
    }
  }

  updateTimer(expiryTime: number) {
    const now = new Date().getTime();
    const diff = expiryTime - now;
    if (diff <= 0) {
      this.remainingTime = '00:00';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      // HẾT THỜI GIAN -> HỦY GIAO DỊCH VÀ XÓA ĐĂNG KÝ
      if (this.selectedPayment && this.selectedPayment.rawPayment) {
        this.selectedPayment.status = 'cancelled';
        this.cancelExpiredPaymentAndRegistration(this.selectedPayment.rawPayment);
      }
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      this.remainingTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  private cancelExpiredPaymentAndRegistration(rawPayment: any) {
    if (rawPayment._id && rawPayment.trangThaiThanhToan !== 'Đã hủy') {
      // Cập nhật payment thành Đã hủy
      this.paymentService.updatePayment(rawPayment._id, { trangThaiThanhToan: 'Đã hủy' }).subscribe({
        next: () => {
          rawPayment.trangThaiThanhToan = 'Đã hủy'; // Update local memory
        }
      });
      
      // Xóa bản ghi registration
      this.registrationService.getRegistrations().subscribe(regs => {
        const reg = regs.find(r => r.maDangKy === rawPayment.maDangKy);
        if (reg && reg._id) {
          this.registrationService.deleteRegistration(reg._id).subscribe({
            next: () => {
              this.loadRegisteredClasses(this.customerCode); // Cập nhật lại UI lớp học
            }
          });
        }
      });
    }
  }

  cancelPayment(payment: PaymentDetail) {
    if (!confirm('Bạn có chắc chắn muốn hủy giao dịch này không?')) return;

    if (payment.rawPayment && payment.rawPayment._id) {
      this.paymentService.updatePayment(payment.rawPayment._id, {
        trangThaiThanhToan: 'Đã hủy'
      }).subscribe({
        next: () => {
          payment.rawPayment.trangThaiThanhToan = 'Đã hủy';
          this.cancelExpiredPaymentAndRegistration(payment.rawPayment);
          if ((this as any).closeCancelConfirmModal) {
             (this as any).closeCancelConfirmModal();
          }
          this.loadPayments(this.customerCode);
        },
        error: () => this.notification.show('Lỗi', 'Hủy thanh toán thất bại!', 'error')
      });
    }
  }

  simulatePaymentSuccess() {
    if (!this.selectedPayment || !this.selectedPayment.rawPayment || !this.selectedPayment.rawPayment._id) {
      return;
    }
    
    // Update Payment
    this.paymentService.updatePayment(this.selectedPayment.rawPayment._id, {
      trangThaiThanhToan: 'Đã thanh toán',
      soTienConLai: 0
    }).subscribe({
      next: () => {
        // Find Registration and Update
        this.registrationService.getRegistrations().subscribe({
          next: (regs) => {
            const reg = regs.find(r => r.maDangKy === this.selectedPayment!.paymentCode);
            if (reg && reg._id) {
              this.registrationService.updateRegistration(reg._id, { trangThai: 'Đang hoạt động' }).subscribe({
                next: () => {
                  this.notification.show('Thành công', 'Test thanh toán thành công!', 'success');
                  this.loadPayments(this.customerCode); // Reload data
                  this.closePaymentPopup();
                }
              });
            } else {
              this.notification.show('Thành công', 'Test thanh toán thành công (không tìm thấy đăng ký tương ứng)!', 'success');
              this.loadPayments(this.customerCode);
              this.closePaymentPopup();
            }
          }
        });
      },
      error: () => this.notification.show('Lỗi', 'Test thanh toán thất bại!', 'error')
    });
  }

  copiedField: string | null = null;

  getQrUrl(payment: PaymentDetail): string {
    if (!payment) return '';
    const bankId = 'mbbank';
    const accountNo = '19062026';
    const template = 'qr_only';
    const accountName = encodeURIComponent('CONG TY CO PHAN DOPASSION');
    const amount = payment.amountAfterVoucher || 0;
    const addInfo = encodeURIComponent(`DOPASSION ${payment.paymentCode}`);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  }

  copyToClipboard(text: string, field: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.copiedField = field;
      setTimeout(() => {
        if (this.copiedField === field) {
          this.copiedField = null;
        }
      }, 2000);
    });
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

    this.notification.show('Lỗi', 'Vui lòng chọn file ảnh', 'error');

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

