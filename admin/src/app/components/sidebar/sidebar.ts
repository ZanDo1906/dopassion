import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  routerLinkActiveOptions = { exact: false };

  constructor(private router: Router) {}

  logout() {
    // Thực hiện logic đăng xuất ở đây (xóa token, session, etc.)
    // Sau đó navigate đến trang login
    this.router.navigate(['/login']);
  }

}
