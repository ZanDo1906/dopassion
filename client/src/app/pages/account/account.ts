import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistrationService } from '../../services/registration';
import { Class } from '../../services/class';
import { Payment } from '../../services/payment';
import { RefundService } from '../../services/refund';
import { iRefund } from '../../interfaces/refund';
import { NotificationService } from '../../services/notification.service';
import { Customer as CustomerService } from '../../services/customer';
import { environment } from '../../../environments/environments';
import { forkJoin } from 'rxjs';

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
  status: 'pending_enrollment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
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
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' | 'pending_refund' | 'rejected_refund';
  paymentDate: string;
  paymentDateTime: string;
  updatedDateTime: string;
  note: string;
  rejectReason?: string;
  showReason?: boolean;
  refundRequestedDateTime?: string;
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
    private refundService: RefundService,
    private notification: NotificationService,
    private customerService: CustomerService
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
  customerId: string = '';
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
  classFilter: 'all' | 'pending_enrollment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'all';
  paymentFilter: 'all' | 'pending' | 'completed' | 'cancelled' | 'refunded' | 'pending_refund' | 'rejected_refund' = 'all';

  // REFUND POPUP
  showRefundConfirmPopup: boolean = false;
  refundTargetPayment: PaymentDetail | null = null;
  refundCalculatedAmount: number = 0;
  refundSessionsTotal: number = 0;
  refundSessionsAttended: number = 0;
  refundSessionsRemaining: number = 0;
  isProcessingRefund: boolean = false;
  userRefundReason: string = '';

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

    // Tự động reload data khi chuyển tab
    if (view === 'classes') {
      this.loadRegisteredClasses(this.customerCode);
    } else if (view === 'payment') {
      this.loadPayments(this.customerCode);
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

    this.customerId = user._id || '';
    this.avatarPreview = user.avatar ? (user.avatar.startsWith('http') ? user.avatar : environment.apiUrl + user.avatar) : null;

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

        // Lọc đăng ký theo khách hàng, đảo ngược mảng để cái mới nhất lên trên
        const myRegistrations = registrations.filter(
          r => r.maKh === maKh
        ).reverse();

        console.log('MY REGISTRATIONS:', myRegistrations);

        forkJoin({
          classList: this.classService.getClasses(),
          payments: this.paymentService.getPayments()
        }).subscribe({

          next: ({ classList, payments }) => {

            console.log('ALL CLASSES:', classList);

            this.classes = myRegistrations.map((item, index) => {

              // tìm class theo maLop
              const classInfo = classList.find(

                c => c.maLop === item.maLop

              );

              // tìm payment theo maDangKy
              const paymentInfo = payments.find(
                p => p.maDangKy === item.maDangKy
              );

              let statusText: 'pending_enrollment' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled' = 'pending_enrollment';

              if (paymentInfo?.trangThaiThanhToan === 'Đã hủy' || item.trangThai === 'Đã khóa') {
                statusText = 'cancelled';
              } else if (paymentInfo?.trangThaiThanhToan === 'Đã thanh toán') {
                const now = new Date().getTime();
                const startDate = classInfo?.ngayBatDau ? new Date(classInfo.ngayBatDau).getTime() : 0;
                let endDateTime = 0;
                if (classInfo?.ngayKetThuc) {
                  const d = new Date(classInfo.ngayKetThuc);
                  d.setHours(23, 59, 59, 999);
                  endDateTime = d.getTime();
                }

                if (startDate > 0 && now < startDate) {
                  statusText = 'upcoming';
                } else if (endDateTime > 0 && now > endDateTime) {
                  statusText = 'completed';
                } else {
                  statusText = 'ongoing';
                }
              }

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

                status: statusText,

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

            console.error('Lỗi load class or payment:', err);

          }

        });

      },

      error: (err) => {

        console.error('Lỗi load registration:', err);

      }

    });

  }
  loadPayments(maKhachHang: string) {

    forkJoin({
      payments: this.paymentService.getPayments(),
      refunds: this.refundService.getRefunds()
    }).subscribe({

      next: (data) => {

        console.log('ALL PAYMENTS:', data.payments);
        console.log('ALL REFUNDS:', data.refunds);

        const myPayments = data.payments.filter(
          p => p.maKh === maKhachHang
        ).reverse();

        const myRefunds = data.refunds.filter(r => r.maKh === maKhachHang);

        this.payments = myPayments.map((item, index) => {

          const matchedRefund = myRefunds.find(r => r.maDangKy === item.maDangKy);

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

            refundAmount: matchedRefund ? matchedRefund.soTienHoan : 0,

            paymentMethod: 'Chưa cập nhật',

            status: (() => {
              // Nếu có bản ghi refund, trạng thái phụ thuộc vào refund
              if (matchedRefund) {
                if (matchedRefund.trangThai === 'Chờ duyệt') return 'pending_refund' as const;
                if (matchedRefund.trangThai === 'Đã hoàn tiền' || matchedRefund.trangThai === 'Đã duyệt') return 'refunded' as const;
                if (matchedRefund.trangThai === 'Đã hủy') return 'rejected_refund' as const;
              }

              // Nếu không, trả về trạng thái của payment
              if (item.trangThaiThanhToan === 'Đã thanh toán') return 'completed';
              if (item.trangThaiThanhToan === 'Đã hủy') return 'cancelled';

              // Check 10 minutes expiry cho trạng thái pending
              if (item.ngayDangKy) {
                const diffMs = new Date().getTime() - new Date(item.ngayDangKy).getTime();
                const diffMins = diffMs / 60000;
                if (diffMins > 10 && item.trangThaiThanhToan !== 'Đã thanh toán') {
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

            updatedDateTime: (matchedRefund && matchedRefund.updatedAt) ? (() => {
                const d = new Date(matchedRefund.updatedAt);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              })() : (item.updatedAt || item.ngayDangKy
              ? (() => {
                const d = new Date(item.updatedAt || item.ngayDangKy);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              })()
              : ''),

            note: '',
            rejectReason: matchedRefund ? matchedRefund.lyDoTuChoi : '',
            showReason: false,
            refundRequestedDateTime: (matchedRefund && matchedRefund.createdAt) ? (() => {
                const d = new Date(matchedRefund.createdAt);
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
              })() : '',
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
    document.body.style.overflow = 'hidden';
  }

  closeClassPopup() {
    this.showClassPopup = false;
    this.selectedClass = null;
    document.body.style.overflow = '';
  }

  openPaymentPopup(payment: PaymentDetail) {
    this.selectedPayment = payment;
    this.showPaymentPopup = true;
    this.startTimer();
    document.body.style.overflow = 'hidden';
  }

  closePaymentPopup() {
    this.showPaymentPopup = false;
    this.selectedPayment = null;
    this.copiedField = null;
    document.body.style.overflow = '';
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
    if (!rawPayment || !rawPayment._id) return;

    if (rawPayment.trangThaiThanhToan !== 'Đã hủy') {
      // Cập nhật payment thành Đã hủy
      this.paymentService.updatePayment(rawPayment._id, { trangThaiThanhToan: 'Đã hủy' }).subscribe({
        next: () => {
          rawPayment.trangThaiThanhToan = 'Đã hủy'; // Update local memory
        }
      });
    }

    // Khóa bản ghi registration (thay vì xóa) để học viên có thể đăng ký lại mà không bị lỗi
    this.registrationService.getRegistrations().subscribe(regs => {
      const reg = regs.find(r => r.maDangKy === rawPayment.maDangKy);
      if (reg && reg._id && reg.trangThai !== 'Đã khóa') {
        this.registrationService.updateRegistration(reg._id, { trangThai: 'Đã khóa' }).subscribe({
          next: () => {
            this.loadRegisteredClasses(this.customerCode); // Cập nhật lại UI lớp học
          }
        });
      }
    });
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
      this.saveProfileChanges();
    } else {
      this.isEditingProfile = true;
    }
  }

  saveProfileChanges() {
    if (!this.customerId) {
      this.notification.show('Lỗi', 'Không tìm thấy ID người dùng', 'error');
      return;
    }

    this.isUploading = true;

    const updateDetails = (avatarUrl?: string) => {
      const updateData: any = {
        tenKhachHang: this.fullName,
        sdt: Number(this.phoneNumber),
        email: this.email,
        ngaySinh: this.dateOfBirth ? new Date(this.dateOfBirth) : null
      };

      if (avatarUrl) {
        updateData.avatar = avatarUrl;
      }

      this.customerService.updateCustomer(this.customerId, updateData).subscribe({
        next: (updatedCustomer) => {
          const userData = localStorage.getItem('currentUser');
          if (userData) {
            const user = JSON.parse(userData);
            const mergedUser = { ...user, ...updatedCustomer };
            localStorage.setItem('currentUser', JSON.stringify(mergedUser));
          }

          this.notification.show('Thành công', 'Cập nhật thông tin thành công', 'success');
          this.isUploading = false;
          this.isEditingProfile = false;
          this.selectedFile = null;
        },
        error: (err) => {
          this.notification.show('Lỗi', err.error?.message || 'Không thể cập nhật thông tin', 'error');
          this.isUploading = false;
        }
      });
    };

    if (this.selectedFile) {
      this.customerService.uploadAvatar(this.customerId, this.selectedFile).subscribe({
        next: (res) => {
          updateDetails(res.avatar);
        },
        error: (err) => {
          this.notification.show('Lỗi', err.error?.message || 'Không thể tải lên ảnh đại diện', 'error');
          this.isUploading = false;
        }
      });
    } else {
      updateDetails();
    }
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

    this.selectedFile = file;

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

  // ===== REFUND FEATURE =====

  /**
   * Mở popup xác nhận hoàn tiền.
   * Tính số buổi đã học dựa trên lịch học (khungGio) từ ngày khai giảng đến hôm nay.
   */
  openRefundConfirm(payment: PaymentDetail): void {
    this.refundTargetPayment = payment;
    const rawPayment = payment.rawPayment;
    if (!rawPayment) return;

    // Tìm thông tin lớp học để lấy ngayBatDau, ngayKetThuc, khungGio
    this.classService.getClasses().subscribe({
      next: (classList) => {
        const classInfo = classList.find(c => c.maLop === rawPayment.maLop);
        if (!classInfo) {
          this.notification.show('Lỗi', 'Không tìm thấy thông tin lớp học', 'error');
          return;
        }

        const startDate = new Date(classInfo.ngayBatDau);
        const endDate = new Date(classInfo.ngayKetThuc);
        const today = new Date();
        const schedule = classInfo.khungGio || '';

        // Parse lịch học để đếm số ngày học trong tuần
        // VD khungGio: "T2, T4, T6 (18:00-20:00)" hoặc "Thứ 2 - Thứ 4 - Thứ 6"
        const daysPerWeek = this.countScheduleDaysPerWeek(schedule);

        // Tính tổng số buổi = số tuần * số buổi/tuần
        // Yêu cầu: "mỗi khóa có 2 tháng là 8 tuần", tức là 1 tháng = 4 tuần.
        const diffDays = (endDate.getTime() - startDate.getTime()) / (24 * 3600 * 1000);
        const diffMonths = Math.round(diffDays / 30);
        let totalWeeks = Math.round(diffDays / 7);
        
        // Nếu số ngày xấp xỉ số tháng tròn (sai số <= 7 ngày), ép về quy tắc 1 tháng = 4 tuần
        if (diffMonths > 0 && Math.abs(diffDays - diffMonths * 30) <= 7) {
            totalWeeks = diffMonths * 4;
        } else {
            totalWeeks = Math.max(1, Math.round(diffDays / 7));
        }
        
        const totalSessions = totalWeeks * daysPerWeek;

        // Tính số buổi đã học từ ngày khai giảng đến hôm nay
        const elapsedWeeks = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (7 * 24 * 3600 * 1000)));
        const elapsedDaysInPartialWeek = Math.max(0, Math.ceil(((today.getTime() - startDate.getTime()) % (7 * 24 * 3600 * 1000)) / (24 * 3600 * 1000)));

        // Đếm chính xác hơn: tính số buổi đã trôi qua
        let attendedSessions = this.countSessionsBetween(startDate, today, schedule);
        if (attendedSessions < 0) attendedSessions = 0;
        if (attendedSessions > totalSessions) attendedSessions = totalSessions;

        const remainingSessions = Math.max(0, totalSessions - attendedSessions);

        // Tính số tiền hoàn lại
        const amountPaid = payment.amountAfterVoucher || 0;
        const refundAmount = totalSessions > 0 ? Math.round((amountPaid / totalSessions) * remainingSessions) : 0;

        this.refundSessionsTotal = totalSessions;
        this.refundSessionsAttended = attendedSessions;
        this.refundSessionsRemaining = remainingSessions;
        this.refundCalculatedAmount = refundAmount;
        this.showRefundConfirmPopup = true;
        document.body.style.overflow = 'hidden';
      },
      error: () => {
        this.notification.show('Lỗi', 'Không thể tải thông tin lớp học', 'error');
      }
    });
  }

  closeRefundConfirm(): void {
    this.showRefundConfirmPopup = false;
    this.refundTargetPayment = null;
    this.refundCalculatedAmount = 0;
    this.userRefundReason = '';
    document.body.style.overflow = '';
  }

  /**
   * Đếm số ngày học trong tuần dựa trên chuỗi lịch học
   * VD: "T2, T4, T6 (18:00-20:00)" → 3
   */
  private countScheduleDaysPerWeek(schedule: string): number {
    if (!schedule) return 3; // mặc định 3 buổi/tuần

    const s = schedule.toUpperCase();
    const dayPatterns = [
      /T2|THỨ\s*2|THỨ\s*HAI/gi,
      /T3|THỨ\s*3|THỨ\s*BA/gi,
      /T4|THỨ\s*4|THỨ\s*TƯ/gi,
      /T5|THỨ\s*5|THỨ\s*NĂM/gi,
      /T6|THỨ\s*6|THỨ\s*SÁU/gi,
      /T7|THỨ\s*7|THỨ\s*BẢY/gi,
      /CN|CHỦ\s*NHẬT/gi
    ];

    let count = 0;
    for (const pattern of dayPatterns) {
      if (pattern.test(s)) count++;
    }

    return count > 0 ? count : 3; // fallback 3
  }

  /**
   * Đếm chính xác số buổi học giữa 2 ngày dựa trên lịch học
   */
  private countSessionsBetween(from: Date, to: Date, schedule: string): number {
    const s = schedule.toUpperCase();

    // Mapping JS day (0=CN, 1=T2, ..., 6=T7)
    const scheduleDays: number[] = [];
    if (/T2|THỨ\s*2|THỨ\s*HAI/i.test(s)) scheduleDays.push(1);
    if (/T3|THỨ\s*3|THỨ\s*BA/i.test(s)) scheduleDays.push(2);
    if (/T4|THỨ\s*4|THỨ\s*TƯ/i.test(s)) scheduleDays.push(3);
    if (/T5|THỨ\s*5|THỨ\s*NĂM/i.test(s)) scheduleDays.push(4);
    if (/T6|THỨ\s*6|THỨ\s*SÁU/i.test(s)) scheduleDays.push(5);
    if (/T7|THỨ\s*7|THỨ\s*BẢY/i.test(s)) scheduleDays.push(6);
    if (/CN|CHỦ\s*NHẬT/i.test(s)) scheduleDays.push(0);

    if (scheduleDays.length === 0) {
      // Fallback: T2, T4, T6
      scheduleDays.push(1, 3, 5);
    }

    let count = 0;
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(0, 0, 0, 0);

    while (cursor <= end) {
      if (scheduleDays.includes(cursor.getDay())) {
        count++;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return count;
  }

  /**
   * Xác nhận hoàn tiền: cập nhật payment, registration, tạo refund record
   */
  confirmRefund(): void {
    if (!this.refundTargetPayment || !this.refundTargetPayment.rawPayment || this.isProcessingRefund) return;

    if (!this.userRefundReason || !this.userRefundReason.trim()) {
      this.notification.show('Lỗi', 'Vui lòng nhập lý do hoàn tiền', 'warning');
      return;
    }

    this.isProcessingRefund = true;
    const rawPayment = this.refundTargetPayment.rawPayment;

    // Không cập nhật Payment, chỉ tạo bản ghi Refund
    this.createRefundRecord(rawPayment);
  }

  private createRefundRecord(rawPayment: any): void {
    const refundData: iRefund = {
      maDangKy: rawPayment.maDangKy || '',
      maKh: rawPayment.maKh || '',
      tenKh: rawPayment.tenKh || '',
      maLop: rawPayment.maLop || '',
      tenLopHoc: rawPayment.tenLopHoc || '',
      khoaHoc: rawPayment.khoaHoc || '',
      tenKhoa: rawPayment.tenKhoa || '',
      chiNhanh: rawPayment.chiNhanh || '',
      ngayDangKy: rawPayment.ngayDangKy || '',
      daThanhToan: this.refundTargetPayment?.amountAfterVoucher || 0,
      soTienHoan: this.refundCalculatedAmount,
      lyDoYeuCauHoanTien: `${this.userRefundReason.trim()} (Hệ thống ghi nhận: Học viên yêu cầu hủy lớp. Đã học ${this.refundSessionsAttended}/${this.refundSessionsTotal} buổi, còn lại ${this.refundSessionsRemaining} buổi.)`,
      lyDoChapNhanHoanTien: 'Hệ thống tự động xử lý',
      lyDoTuChoi: '',
      trangThai: 'Chờ duyệt'
    };

    this.refundService.addRefund(refundData).subscribe({
      next: () => {
        this.isProcessingRefund = false;
        this.closeRefundConfirm();
        this.notification.show(
          'Yêu cầu hoàn tiền đã được gửi',
          `Yêu cầu hoàn ${this.formatCurrency(this.refundCalculatedAmount)} VND đang chờ duyệt. Bạn sẽ được thông báo khi yêu cầu được xử lý.`,
          'success'
        );
        // Reload dữ liệu
        this.loadPayments(this.customerCode);
        this.loadRegisteredClasses(this.customerCode);
      },
      error: () => {
        this.isProcessingRefund = false;
        this.notification.show('Lỗi', 'Không thể tạo bản ghi hoàn tiền', 'error');
      }
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount || 0);
  }
}

