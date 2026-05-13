import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { iClass, ClassFilter } from '../interfaces/class';

@Injectable({
  providedIn: 'root',
})
export class Class {
  url: string = 'assets/mock-data-json/class.json';
  
  // Branch mapping từ code sang tên
  private branchMap: { [key: string]: string } = {
    'CN1': 'Hà Nội',
    'CN2': 'TP. HCM',
    'CN3': 'Đà Nẵng'
  };

  constructor(private http: HttpClient) { }

  /**
   * Lấy danh sách lớp học với hỗ trợ filtering server-side
   * @param filters - Đối tượng chứa các điều kiện lọc
   * @returns Observable chứa dữ liệu đã được lọc
   */
  getClasses(filters?: ClassFilter): Observable<any[]> {
    return this.http.get<iClass[]>(this.url).pipe(
      map(data => this.applyFilters(data, filters || {}))
    );
  }

  /**
   * Áp dụng các bộ lọc lên dữ liệu
   * Logic xử lý lọc được đặt tại Service để dễ dàng migrate sang API thật
   * @param data - Dữ liệu gốc từ JSON hoặc API
   * @param filters - Bộ lọc cần áp dụng
   * @returns Dữ liệu đã được lọc
   */
  private applyFilters(data: iClass[], filters: ClassFilter): any[] {
    if (!data || data.length === 0) {
      return [];
    }

    return data.filter(cls => {
      // Lọc theo Mã khóa (courseCode)
      if (filters.courseCode && cls['Mã khóa'] !== filters.courseCode) {
        return false;
      }

      // Lọc theo Chi nhánh (branch)
      if (filters.branch && cls['Chi nhánh'] !== filters.branch) {
        return false;
      }

      // Lọc theo khoảng thời gian Ngày bắt đầu (startDate và endDate)
      // QUAN TRỌNG: So sánh Date object, không so sánh string
      if (filters.startDate || filters.endDate) {
        // Lấy ngày khai giảng của khóa học từ JSON
        // Format: "2026-05-05 00:00:00" hoặc "2026-05-05"
        const classStartDateStr = cls['Ngày bắt đầu'].split(' ')[0]; // Lấy phần ngày
        const classStartDate = this.parseDate(classStartDateStr);
        
        // Lọc theo ngày bắt đầu filter (from date)
        if (filters.startDate) {
          const filterStartDate = this.parseDate(filters.startDate);
          // Nếu ngày khai giảng của khóa < ngày bắt đầu filter, loại bỏ
          if (this.compareDate(classStartDate, filterStartDate) < 0) {
            return false;
          }
        }

        // Lọc theo ngày kết thúc filter (to date)
        if (filters.endDate) {
          const filterEndDate = this.parseDate(filters.endDate);
          // Nếu ngày khai giảng của khóa > ngày kết thúc filter, loại bỏ
          if (this.compareDate(classStartDate, filterEndDate) > 0) {
            return false;
          }
        }
      }

      // Lọc theo keyword (tìm kiếm trong tên lớp hoặc giảng viên)
      if (filters.keyword && filters.keyword.trim()) {
        const keyword = filters.keyword.toLowerCase().trim();
        const tenLop = cls['Tên lớp'].toLowerCase();
        const giangVien = cls['Giảng viên'].toLowerCase();
        
        if (!tenLop.includes(keyword) && !giangVien.includes(keyword)) {
          return false;
        }
      }

      return true;
    }).map((cls, index) => {
      // Transform dữ liệu từ JSON sang format sử dụng ở Component
      const maCourse = cls['Mã khóa'];
      const branchCode = cls['Chi nhánh'];
      const branchName = this.branchMap[branchCode] || branchCode;
      
      return {
        id: index + 1,
        type: maCourse,
        branch: branchName,
        startDate: cls['Ngày bắt đầu'],
        title: cls['Tên lớp'],
        schedule: cls['Khung giờ'],
        lessons: '24 buổi',
        hasTest: true,
        instructor: cls['Giảng viên'],
        classCode: cls['Mã lớp'],
        endDate: cls['Ngày kết thúc']
      };
    });
  }

  /**
   * Parse ngày từ chuỗi thành Date object
   * Hỗ trợ format: "YYYY-MM-DD" hoặc "YYYY-MM-DD HH:mm:ss"
   * @param dateStr - Chuỗi ngày
   * @returns Date object (time được set to 00:00:00)
   */
  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date(0); // Giá trị mặc định nếu rỗng
    
    // Lấy phần ngày (YYYY-MM-DD)
    const datePart = dateStr.split(' ')[0];
    const [year, month, day] = datePart.split('-').map(x => parseInt(x, 10));
    
    // Tạo Date object (giờ = 0, phút = 0, giây = 0 để so sánh chính xác)
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return date;
  }

  /**
   * So sánh 2 Date object theo ngày (bỏ qua thời gian)
   * @param date1 - Ngày thứ nhất
   * @param date2 - Ngày thứ hai
   * @returns -1 nếu date1 < date2, 0 nếu bằng, 1 nếu date1 > date2
   */
  private compareDate(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    if (d1 < d2) return -1;
    if (d1 > d2) return 1;
    return 0;
  }

  /**
   * Hàm cũ được giữ lại để backward compatibility
   * @deprecated Sử dụng getClasses(filters) thay thế
   */
  getClass(): Observable<iClass[]> {
    return this.http.get<iClass[]>(this.url);
  }
}
