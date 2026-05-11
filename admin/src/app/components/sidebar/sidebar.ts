import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  constructor(private router: Router) {}

  logout() {
    // Thực hiện logic đăng xuất ở đây (xóa token, session, etc.)
    // Sau đó navigate đến trang login
    this.router.navigate(['/login']);
  }

}
