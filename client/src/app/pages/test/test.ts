import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { iClass } from '../../interfaces/class';
import { iClient } from '../../interfaces/client';
import { iContact } from '../../interfaces/contact';
import { iCourse } from '../../interfaces/course';
import { iFeedback } from '../../interfaces/feedback';
import { iPayment } from '../../interfaces/payment';
import { iRefund } from '../../interfaces/refund';
import { iRegistration } from '../../interfaces/registration';
import { iRole } from '../../interfaces/role';
import { iStaff } from '../../interfaces/staff';
import { iVoucher } from '../../interfaces/voucher';
import { Class } from '../../services/class';
import { Client } from '../../services/client';
import { Contact } from '../../services/contact';
import { Course } from '../../services/course';
import { Feedback } from '../../services/feedback';
import { Payment } from '../../services/payment';
import { Refund } from '../../services/refund';
import { Registration } from '../../services/registration';
import { Role } from '../../services/role';
import { Staff } from '../../services/staff';
import { Voucher } from '../../services/voucher';

@Component({
  selector: 'app-test',
  imports: [CommonModule],
  templateUrl: './test.html',
  styleUrl: './test.css',
})
export class Test {
  classList$: Observable<iClass[]>;
  clientList$: Observable<iClient[]>;
  contactList$: Observable<iContact[]>;
  courseList$: Observable<iCourse[]>;
  feedbackList$: Observable<iFeedback[]>;
  paymentList$: Observable<iPayment[]>;
  refundList$: Observable<iRefund[]>;
  registrationList$: Observable<iRegistration[]>;
  roleList$: Observable<iRole[]>;
  staffList$: Observable<iStaff[]>;
  voucherList$: Observable<iVoucher[]>;

  constructor(
    private classService: Class,
    private clientService: Client,
    private contactService: Contact,
    private courseService: Course,
    private feedbackService: Feedback,
    private paymentService: Payment,
    private refundService: Refund,
    private registrationService: Registration,
    private roleService: Role,
    private staffService: Staff,
    private voucherService: Voucher
  ) {
    this.classList$ = this.classService.getClass();
    this.clientList$ = this.clientService.getClient();
    this.contactList$ = this.contactService.getContact();
    this.courseList$ = this.courseService.getCourse();
    this.feedbackList$ = this.feedbackService.getFeedback();
    this.paymentList$ = this.paymentService.getPayment();
    this.refundList$ = this.refundService.getRefund();
    this.registrationList$ = this.registrationService.getRegistration();
    this.roleList$ = this.roleService.getRole();
    this.staffList$ = this.staffService.getStaff();
    this.voucherList$ = this.voucherService.getVoucher();
  }
}
