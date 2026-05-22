import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  constructor(private router: Router) {}
  currentView: 'info' | 'classes' | 'payment' | 'schedule' = 'info';
  fullName: string = '';
  phoneNumber: string = '';
  email: string = '';
  customerCode: string = '';
  dateOfBirth: string = '';
  joinDate: string = '';
  showPasswordForm: boolean = false;

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
  payments: PaymentDetail[] = [
    {
      id: 1,
      className: 'LỚP HỌC TOEIC SW107',
      paymentCode: 'DNN24925',
      amountBeforeVoucher: 3500000,
      voucher: 'VOUCHER50',
      amountAfterVoucher: 3000000,
      amountPaid: 3000000,
      refundAmount: 500000,
      paymentMethod: 'Chuyển khoản',
      status: 'pending',
      paymentDate: '23/12/2025',
      note: 'Hoàn tiền do nghỉ học',
    },
    {
      id: 2,
      className: 'LỚP HỌC TOEIC SW108',
      paymentCode: 'DNN24926',
      amountBeforeVoucher: 3500000,
      voucher: 'VOUCHER30',
      amountAfterVoucher: 3200000,
      amountPaid: 3200000,
      refundAmount: 0,
      paymentMethod: 'Tiền mặt',
      status: 'completed',
      paymentDate: '25/12/2025',
      note: '',
    }
  ];

  // HÀM XỬ LÝ LỌC DỮ LIỆU
  get filteredClasses() {
    if (this.classFilter === 'all') return this.classes;
    return this.classes.filter(c => c.status === this.classFilter);
  }

  get filteredPayments() {
    if (this.paymentFilter === 'all') return this.payments;
    return this.payments.filter(p => p.status === this.paymentFilter);
  }

  // Vietnamese holidays
  holidays: Holiday[] = [
    { month: 1, date: 1, name: 'Tết Dương lịch', blessing: 'Chúc bạn một năm mới thành công, sức khỏe dồi dào và hạnh phúc!' },
    { month: 2, date: 10, name: 'Tết Nguyên Đán', blessing: 'Tết vui vẻ, vạn sự như ý, tiền tài tứ tung!' },
    { month: 4, date: 18, name: 'Giỗ Tổ Hùng Vương', blessing: 'Kính nhớ những ông cha anh hùng và công lao lao động xây dựng đất nước!' },
    { month: 4, date: 30, name: 'Ngày Thống Nhất', blessing: 'Chúc mừng ngày Thống Nhất nước nhà! Hãy cùng xây dựng một đất nước thịnh vượng!' },
    { month: 5, date: 1, name: 'Ngày Quốc Tế Lao động', blessing: 'Tôn vinh những công lao xây dựng và phát triển của giai cấp lao động!' },
    { month: 9, date: 2, name: 'Ngày Quốc khánh', blessing: 'Chúc mừng ngày Quốc khánh Việt Nam! Hãy tự hào là con em dân tộc Việt!' },
  ];
  
  // Mock events
  events: { month: number; date: number }[] = [
    { month: 12, date: 22 },
    { month: 12, date: 25 },
    { month: 12, date: 29 },
    { month: 12, date: 31 },
  ];
  
  // Available years for selection
  years: number[] = [2024, 2025, 2026, 2027, 2028];
  
  // Month names
  monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  
  // Mock class data
  classes: ClassDetail[] = [
    {
      id: 1,
      name: 'LỚP TOEIC LR108',
      code: 'DNN24925',
      instructor: 'Mr. ĐÔNG TRƯỜNG',
      startDate: '22/12/2025',
      endDate: '28/02/2026',
      status: 'upcoming',
      branch: 'Chi nhánh Quận 1',
      room: 'Phòng 305',
      schedule: 'Thứ 2, 4, 6',
      startTime: '09:00',
      endTime: '11:30'
    },
    {
      id: 2,
      name: 'LỚP TOEIC SW108',
      code: 'DNN24926',
      instructor: 'Mr. ĐÔNG TRƯỜNG',
      startDate: '22/12/2025',
      endDate: '25/02/2026',
      status: 'ongoing',
      branch: 'Chi nhánh Quận 3',
      room: 'Phòng 201',
      schedule: 'Thứ 3, 5, 7',
      startTime: '14:00',
      endTime: '16:30'
    }
  ];

  switchView(view: 'info' | 'classes' | 'payment' | 'schedule') {
    this.currentView = view;
  }

  ngOnInit() {

  this.generateCalendar();

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

}}
  generateCalendar() {
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    this.calendarDays = [];
    
    const prevMonthLastDay = new Date(this.selectedYear, this.selectedMonth - 1, 0).getDate();
    for (let i = adjustedStartDay; i > 0; i--) {
      this.calendarDays.push({
        date: prevMonthLastDay - i + 1,
        isCurrentMonth: false,
        isToday: false,
        isHoliday: false,
        hasEvent: false,
      });
    }
    
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === this.selectedMonth - 1 && 
                      today.getFullYear() === this.selectedYear;
      
      const holiday = this.holidays.find(h => h.month === this.selectedMonth && h.date === i);
      const hasEvent = this.events.some(e => e.month === this.selectedMonth && e.date === i);
      
      this.calendarDays.push({
        date: i,
        isCurrentMonth: true,
        isToday,
        isHoliday: !!holiday,
        holidayName: holiday?.name,
        hasEvent,
      });
    }
    
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        isHoliday: false,
        hasEvent: false,
      });
    }
    
    this.calendarTitle = `${this.monthNames[this.selectedMonth - 1]}, ${this.selectedYear}`;
  }

  onMonthChange(event: Event) {
    const month = parseInt((event.target as HTMLSelectElement).value);
    this.selectedMonth = month;
    this.generateCalendar();
  }

  onYearChange(event: Event) {
    const year = parseInt((event.target as HTMLSelectElement).value);
    this.selectedYear = year;
    this.generateCalendar();
  }

  previousMonth() {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.generateCalendar();
  }

  openHolidayPopup(day: any) {
    const holiday = this.holidays.find(
      h => h.month === this.selectedMonth && h.date === day.date
    );

    if (holiday) {
      this.selectedHoliday = {
        month: holiday.month,
        date: holiday.date,
        name: holiday.name,
        blessing: holiday.blessing
      };
    } else {
      const clickedDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      if (!day.isCurrentMonth) {
          if (day.date > 20) clickedDate.setMonth(this.selectedMonth - 2);
          else clickedDate.setMonth(this.selectedMonth);
      }
      const displayMonth = clickedDate.getMonth() + 1;
      const displayYear = clickedDate.getFullYear();

      this.selectedHoliday = {
        month: displayMonth,
        date: day.date,
        name: 'Không có ngày lễ',
        blessing: `Ngày ${day.date}/${displayMonth}/${displayYear}`
      };
    }  
    this.showHolidayPopup = true;
  }

  closeHolidayPopup() {
    this.showHolidayPopup = false;
    this.selectedHoliday = null;
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
logout(){

  localStorage.removeItem('currentUser');

  this.router.navigate(['/login']);

}

}

