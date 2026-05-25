import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact as ContactService } from '../../services/contact';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  contactForm: FormGroup;
  isLoggedIn: boolean = false;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {

    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }
  ngOnInit(): void {
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    this.isLoggedIn = true;
    const user = JSON.parse(userData);
    this.contactForm.patchValue({
      fullName:
        user.tenKhachHang ||
        user.fullName ||
        '',
      phone:
        user.soDienThoai ||
        user.sdt ||
        user.phone ||
        '',
      email:
        user.email ||
        ''
    });
  }

}

  onSubmitContact(): void {
    if (this.contactForm.valid) {
      const formValues = this.contactForm.value;
      const maLienHe = 'LH' + Math.floor(100000 + Math.random() * 900000);

      const newContact: any = {
        maLienHe: maLienHe,
        tenKhachHang: formValues.fullName,
        soDienThoai: formValues.phone,
        gmail: formValues.email,
        noiDungLienHe: formValues.subject + ' - ' + formValues.message,
        trangThaiLienHe: 'Chưa xử lý'
      };

      this.contactService.addContact(newContact).subscribe({
        next: () => {
          alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
          this.contactForm.reset({

  fullName: this.isLoggedIn
    ? formValues.fullName
    : '',

  phone: this.isLoggedIn
    ? formValues.phone
    : '',

  email: this.isLoggedIn
    ? formValues.email
    : '',

  subject: '',

  message: '',

  agreeToTerms: false

});
        },
        error: (err) => {
          console.error('Lỗi khi gửi yêu cầu liên hệ:', err);
          alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
        }
      });
    }
  }
}
