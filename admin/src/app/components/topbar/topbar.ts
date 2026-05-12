import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

type Breadcrumb = {
  label: string;
  url: string;
};

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  breadcrumbs: Breadcrumb[] = [];

  private readonly labelMap: Record<string, string> = {
    account: 'Tài khoản',
    accounting: 'Kế toán',
    debt: 'Công nợ',
    payment: 'Thanh toán',
    refund: 'Hoàn tiền',
    voucher: 'Voucher',
    courses: 'Quản lý khóa học',
    classes: 'Lớp học',
    interactions: 'Quản lý tương tác',
    feedback: 'Phản hồi',
    request: 'Yêu cầu',
    report: 'Báo cáo',
    'debt-report': 'Báo cáo công nợ',
    'revenue-report': 'Báo cáo doanh thu',
    'student-report': 'Báo cáo học viên',
    setting: 'Cấu hình',
    users: 'Quản lý người dùng',
    customer: 'Khách hàng',
    registration: 'Đăng ký',
    staff: 'Nhân viên',
    role: 'Vai trò',
  };

  constructor(private readonly router: Router) {
    this.updateBreadcrumbs(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.updateBreadcrumbs(navEnd.urlAfterRedirects);
      });
  }

  private updateBreadcrumbs(url: string): void {
    const segments = url
      .split('?')[0]
      .split('#')[0]
      .split('/')
      .filter(Boolean);

    const crumbs: Breadcrumb[] = [];
    let currentUrl = '';

    segments.forEach((segment) => {
      currentUrl += `/${segment}`;
      const label = this.labelMap[segment] ?? this.toTitleCase(segment);
      crumbs.push({ label, url: currentUrl });
    });

    this.breadcrumbs = crumbs;
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
