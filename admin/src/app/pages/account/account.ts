import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.html',
  styleUrl: './account.css',
})
export class Account {
  fullName: string = 'Dương Trọng Nhân';
  phoneNumber: string = '0562173125';
  showPasswordForm: boolean = false;
}

