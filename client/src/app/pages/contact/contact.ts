import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  contactForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  onSubmitContact(): void {
    if (this.contactForm.valid) {
      console.log('Contact form submitted:', this.contactForm.value);
      alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi soonest.');
      this.contactForm.reset();
    }
  }
}
