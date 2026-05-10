import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account implements OnInit {
  currentView: 'info' | 'classes' | 'payment' | 'schedule' = 'info';
  fullName: string = 'Dương Trọng Nhân';
  phoneNumber: string = '0562173125';
  // Calendar properties
  
  // Calendar properties
  selectedYear: number = 2025;
  selectedMonth: number = 12;
  calendarDays: CalendarDay[] = [];
  calendarTitle: string = '';
  
  // Popup properties
  showHolidayPopup: boolean = false;
  selectedHoliday: Holiday | null = null;
  
  // Vietnamese holidays (month, date, name, blessing)
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
  
  // Month names in Vietnamese
  monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  switchView(view: 'info' | 'classes' | 'payment' | 'schedule') {
    this.currentView = view;
  }

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDayOfMonth = new Date(this.selectedYear, this.selectedMonth - 1, 1);
    const lastDayOfMonth = new Date(this.selectedYear, this.selectedMonth, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    // Adjust for Monday start (0 = Monday in our case)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    this.calendarDays = [];
    
    // Add empty days from previous month
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
    
    // Add days of current month
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
    
    // Add empty days from next month
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      this.calendarDays.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        isHoliday: false,
        hasEvent: false,
      });
    }
    
    // Update calendar title
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

      // Tạo đối tượng Date thực tế từ ô lịch để lấy thông tin chính xác
      const clickedDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      if (!day.isCurrentMonth) {
          if (day.date > 20) clickedDate.setMonth(this.selectedMonth - 2); // Tháng trước
          else clickedDate.setMonth(this.selectedMonth); // Tháng sau
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
}
