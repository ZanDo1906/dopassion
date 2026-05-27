import { Component, OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Contact as ContactService } from '../../services/contact';
import { NotificationService } from '../../services/notification.service';

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
    private contactService: ContactService,
    private notification: NotificationService
  ) {

    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9,}$/)]],
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
      
      let phoneVal = String(
        user.soDienThoai ||
        user.sdt ||
        user.phone ||
        ''
      ).trim();

      // Nếu số điện thoại có 9 chữ số và không có số 0 ở đầu (do lưu kiểu Number bị mất số 0), tự động thêm 0
      if (phoneVal && phoneVal.length === 9 && !phoneVal.startsWith('0')) {
        phoneVal = '0' + phoneVal;
      }

      console.log('[Contact Component] User logged in:', user.tenKhachHang, 'Phone:', phoneVal, 'Email:', user.email);

      this.contactForm.patchValue({
        fullName: user.tenKhachHang || user.fullName || '',
        phone: phoneVal,
        email: user.email || ''
      });

      // Disable các field đã được điền tự động để loại bỏ chúng khỏi kiểm tra validate (FormGroup tự động coi control disabled là hợp lệ)
      this.contactForm.get('fullName')?.disable();
      this.contactForm.get('phone')?.disable();
      this.contactForm.get('email')?.disable();
    }
  }

  onSubmitContact(): void {
    if (this.contactForm.valid) {
      const formValues = this.contactForm.getRawValue();
      const maLienHe = 'LH' + Math.floor(100000 + Math.random() * 900000);

      // Lấy thông tin mã khách hàng từ localStorage nếu đã đăng nhập
      const userData = localStorage.getItem('currentUser');
      let maKh = '';
      if (userData) {
        try {
          const user = JSON.parse(userData);
          maKh = user.maKh || user._id || '';
        } catch (e) {}
      }

      const newContact: any = {
        maLienHe: maLienHe,
        maKh: maKh || undefined,
        tenKhachHang: formValues.fullName,
        soDienThoai: String(formValues.phone),
        gmail: formValues.email,
        noiDungLienHe: formValues.subject + ' - ' + formValues.message,
        trangThaiLienHe: 'Chưa xử lý'
      };

      this.contactService.addContact(newContact).subscribe({
        next: () => {
          this.notification.show('Thành công', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.', 'success');
          this.contactForm.reset({
            fullName: this.isLoggedIn ? formValues.fullName : '',
            phone: this.isLoggedIn ? formValues.phone : '',
            email: this.isLoggedIn ? formValues.email : '',
            subject: '',
            message: '',
            agreeToTerms: false
          });
        },
        error: (err) => {
          console.error('Lỗi khi gửi yêu cầu liên hệ:', err);
          this.notification.show('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.', 'error');
        }
      });
    }
  }
}
