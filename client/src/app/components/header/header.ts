import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(private router: Router) { }

  onHelpClick() {
    // TODO: Xử lý click help icon
    console.log('Help clicked');
  }

  onNotificationClick() {
    // TODO: Xử lý click notification icon
    console.log('Notification clicked');
  }

  onAvatarClick() {
    this.router.navigate(['/account']);
  }
}
