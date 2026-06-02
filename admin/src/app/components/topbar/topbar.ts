import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../../../environments/environments';

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
  currentUserName: string = 'Người dùng';
  currentUserRole: string = 'STAFF';
  currentUserAvatar: string = environment.apiUrl + '/uploads/avatar-admin/default-avatar.png';

  private readonly labelMap: Record<string, string> = {
    account: 'Tài khoản',
    accounting: 'Kế toán',
    debt: 'Công nợ',
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
    customer: 'Danh sách khách hàng',
    registration: 'Danh sách đăng ký',
    staff: 'Danh sách nhân viên',
    role: 'Vai trò',
  };

  // Hierarchy map for 3-level breadcrumbs: maps child routes to their parent labels
  private readonly hierarchyMap: Record<string, string[]> = {
    '/users/staff/role': ['Quản lý người dùng', 'Danh sách nhân viên', 'Vai trò'],
    '/users/staff/staff': ['Quản lý người dùng', 'Danh sách nhân viên', 'Nhân viên'],
  };

  constructor(private readonly router: Router) {

    const currentUser =
      localStorage.getItem('currentStaff');

    if (currentUser) {

      const user = JSON.parse(currentUser);

      this.currentUserName =
        user.tenNhanVien || 'Người dùng';

      this.currentUserRole =
        user.vaiTro || 'STAFF';

      const defaultAvatar = '/uploads/avatar-admin/default-avatar.png';
      const rawAvatar = user.anhCccd || defaultAvatar;
      this.currentUserAvatar = rawAvatar.startsWith('http') ? rawAvatar : environment.apiUrl + rawAvatar;
    }
    this.updateBreadcrumbs(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.updateBreadcrumbs(navEnd.urlAfterRedirects);
      });

  }

  private updateBreadcrumbs(url: string): void {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const crumbs: Breadcrumb[] = [];

    // Check if it's a 3-level route in hierarchy map
    if (this.hierarchyMap[cleanUrl]) {
      const labels = this.hierarchyMap[cleanUrl];
      let buildUrl = '';
      labels.forEach((label, index) => {
        if (index === 0) buildUrl = '/users';
        else if (index === 1) buildUrl = '/users/staff';
        else if (index === 2) buildUrl = cleanUrl;
        crumbs.push({ label, url: buildUrl });
      });
    } else {
      // Standard breadcrumb logic for non-hierarchical routes
      const segments = cleanUrl
        .split('/')
        .filter(Boolean);

      let currentUrl = '';
      segments.forEach((segment) => {
        currentUrl += `/${segment}`;
        const label = this.labelMap[segment] ?? this.toTitleCase(segment);
        crumbs.push({ label, url: currentUrl });
      });
    }

    this.breadcrumbs = crumbs;
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase());
  }
}
