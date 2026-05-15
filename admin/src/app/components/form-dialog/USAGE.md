/**
 * FORM DIALOG COMPONENT - HƯỚNG DẪN SỬ DỤNG
 * 
 * Component này hỗ trợ tất cả loại dữ liệu, field, kích cỡ, validation
 * Cách sử dụng linh hoạt cho cả Reactive Forms và Template-driven Forms
 */

/* ============================================================
   1. CÁCH IMPORT & DÙNG CƠ BẢN
   ============================================================ */

import { FormDialogComponent } from './components/form-dialog/form-dialog';

// Trong component cha:
@Component({
  // ...
  imports: [FormDialogComponent]
})
export class MyComponent {
  isDialogOpen = false;
  
  sections = [
    {
      title: 'Thông tin cơ bản',
      fields: [
        { name: 'name', label: 'Tên', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true }
      ]
    }
  ];
  
  onSubmit(data: any) {
    console.log(data);
  }
}

// Trong template:
<app-form-dialog
  *ngIf="isDialogOpen"
  title="Tạo mới"
  [sections]="sections"
  (close)="isDialogOpen = false"
  (submit)="onSubmit($event)">
</app-form-dialog>


/* ============================================================
   2. HỖ TRỢ CÁC LOẠI FIELD
   ============================================================ */

Loại field hỗ trợ:
- text              - Input text thông thường
- email             - Input email (validation)
- password          - Input password
- number            - Input number
- date              - Input date (YYYY-MM-DD)
- time              - Input time (HH:MM)
- datetime-local    - Input ngày giờ
- url               - Input URL
- tel               - Input điện thoại
- select            - Dropdown select
- checkbox          - Checkbox
- radio             - Radio button
- textarea          - Text area
- file              - File upload
- color             - Color picker
- (custom)          - Custom template (see below)

Ví dụ:
fields: [
  { name: 'name', label: 'Tên', type: 'text' },
  { name: 'age', label: 'Tuổi', type: 'number' },
  { name: 'birthDate', label: 'Ngày sinh', type: 'date' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'role', label: 'Chức vụ', type: 'select', 
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' }
    ]
  }
]


/* ============================================================
   3. CẤU HÌNH CHI TIẾT CỦA FIELD
   ============================================================ */

Field config object có thể chứa:

{
  // CƠNG BẢN
  name: string,              // Tên field (bắt buộc)
  label: string,             // Nhãn hiển thị
  type: string,              // Loại field (xem mục 2)
  value?: any,               // Giá trị mặc định
  
  // VALIDATION & STATE
  required?: boolean,        // Bắt buộc nhập
  disabled?: boolean,        // Vô hiệu hóa field
  validators?: any[],        // Angular validators [Validators.required, ...]
  
  // LAYOUT
  colspan?: number,          // Số cột chiếm (1-3), default: 1
  hideLabel?: boolean,       // Ẩn label
  
  // INPUT PROPERTIES
  placeholder?: string,      // Placeholder text
  rows?: number,             // Số dòng cho textarea (default: 3)
  accept?: string,           // Accept file types (cho file input)
  multiple?: boolean,        // Multiple files (cho file input)
  checkboxLabel?: string,    // Label riêng cho checkbox
  
  // SELECT/RADIO OPTIONS
  options?: {
    value: any,
    label: string
  }[],
  
  // CUSTOM TEMPLATE (xem mục 7)
  customTemplate?: TemplateRef<any>
}


/* ============================================================
   4. VALIDATION & ERROR MESSAGES
   ============================================================ */

// Với Reactive Forms:
@Component({
  // ...
})
export class MyComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    age: new FormControl('', [Validators.required, Validators.min(18)])
  });
  
  sections = [
    {
      title: 'Thông tin',
      fields: [
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          validators: [Validators.required, Validators.email]
        },
        {
          name: 'age',
          label: 'Tuổi',
          type: 'number',
          validators: [Validators.required, Validators.min(18)]
        }
      ]
    }
  ];
}

// Trong template:
<app-form-dialog
  title="Form"
  [sections]="sections"
  [formGroup]="form"
  [showErrors]="true"  // Hiển thị error messages
  (submit)="onSubmit($event)">
</app-form-dialog>

// Error messages tự động tạo cho:
- required: 'Trường này là bắt buộc'
- email: 'Email không hợp lệ'
- min/max: 'Giá trị tối thiểu/tối đa ...'
- minlength/maxlength: 'Tối thiểu/tối đa ... ký tự'
- pattern: 'Định dạng không hợp lệ'


/* ============================================================
   5. READ-ONLY MODE (Chỉ xem, không chỉnh sửa)
   ============================================================ */

<app-form-dialog
  title="Chi tiết"
  [sections]="sections"
  [formGroup]="form"
  [isReadOnly]="true"  // Vô hiệu hóa tất cả fields
  (close)="isDialogOpen = false">
</app-form-dialog>


/* ============================================================
   6. LAYOUT LINH HOẠT
   ============================================================ */

// Số cột: default 3, có thể tuỳ chỉnh
<app-form-dialog
  [sections]="sections"
  [columns]="2">  // 2 cột thay vì 3
</app-form-dialog>

// Tuỳ chỉnh per-section:
sections = [
  {
    title: 'Section 1',
    columns: 1,  // 1 cột cho section này
    fields: [...]
  },
  {
    title: 'Section 2',
    columns: 3,  // 3 cột cho section này
    fields: [...]
  }
];

// Tuỳ chỉnh field chiếm nhiều cột:
fields: [
  { name: 'fullName', label: 'Tên đầy đủ', type: 'text', colspan: 2 },
  { name: 'note', label: 'Ghi chú', type: 'textarea', colspan: 3 }  // Toàn bộ hàng
]


/* ============================================================
   7. CUSTOM TEMPLATE CHO FIELD
   ============================================================ */

// Khi muốn render field tùy chỉnh:

@Component({
  // ...
  template: `
    <app-form-dialog
      [sections]="sections"
      [formGroup]="form">
      
      <!-- Template tùy chỉnh cho field tên -->
      <ng-template #customNameField let-field="field" let-formGroup="formGroup">
        <div class="custom-field">
          <input 
            type="text"
            [formControl]="formGroup.get(field.name)"
            placeholder="Nhập tên...">
          <button>Xác thực</button>
        </div>
      </ng-template>
    </app-form-dialog>
  `
})
export class MyComponent {
  @ViewChild('customNameField') customNameField: TemplateRef<any>;
  
  form = new FormGroup({
    name: new FormControl('')
  });
  
  ngAfterViewInit() {
    this.sections = [{
      fields: [
        {
          name: 'name',
          label: 'Tên',
          customTemplate: this.customNameField
        }
      ]
    }];
  }
}


/* ============================================================
   8. TRACK FIELD CHANGES
   ============================================================ */

<app-form-dialog
  [sections]="sections"
  [formGroup]="form"
  (fieldChange)="onFieldChange($event)">  // Emit khi field thay đổi
</app-form-dialog>

onFieldChange(event: {fieldName: string, value: any}) {
  console.log(`Field ${event.fieldName} changed to:`, event.value);
}


/* ============================================================
   9. TÙYCHỈNH NÚT (BUTTON)
   ============================================================ */

<app-form-dialog
  [sections]="sections"
  cancelText="Hủy"
  submitText="Lưu"
  cancelIcon="bi bi-x"
  submitIcon="bi bi-check"
  cancelBtnClass="btn-danger"  // Class CSS tùy chỉnh
  submitBtnClass="btn-success">
</app-form-dialog>


/* ============================================================
   10. AUTO CREATE FORMGROUP (Tự động tạo FormGroup)
   ============================================================ */

// Nếu không truyền [formGroup], component tự động tạo từ sections
<app-form-dialog
  [sections]="sections"
  [autoCreateFormGroup]="true"  // default: true
  (submit)="onSubmit($event)">
</app-form-dialog>

// Hoặc tắt nó để dùng template-driven forms:
<app-form-dialog
  [sections]="sections"
  [autoCreateFormGroup]="false"
  (submit)="onSubmit($event)">
</app-form-dialog>


/* ============================================================
   11. VÍ DỤ HOÀN CHỈNH: FORM TẠOS HỌC VIÊN
   ============================================================ */

@Component({
  // ...
  imports: [FormDialogComponent, CommonModule, FormsModule, ReactiveFormsModule]
})
export class StudentFormComponent {
  isDialogOpen = false;
  form: FormGroup;
  
  sections = [
    {
      title: 'Thông tin cá nhân',
      columns: 2,
      fields: [
        {
          name: 'fullName',
          label: 'Họ và tên',
          type: 'text',
          required: true,
          validators: [Validators.required, Validators.minLength(3)],
          placeholder: 'Nhập họ và tên',
          colspan: 2
        },
        {
          name: 'email',
          label: 'Email',
          type: 'email',
          required: true,
          validators: [Validators.required, Validators.email]
        },
        {
          name: 'phone',
          label: 'Điện thoại',
          type: 'tel',
          validators: [Validators.pattern(/^[0-9]{10}$/)]
        }
      ]
    },
    {
      title: 'Thông tin học tập',
      fields: [
        {
          name: 'course',
          label: 'Khóa học',
          type: 'select',
          required: true,
          options: [
            { value: 'angular', label: 'Angular' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' }
          ]
        },
        {
          name: 'startDate',
          label: 'Ngày bắt đầu',
          type: 'date',
          required: true
        },
        {
          name: 'agreeTerms',
          label: 'Đồng ý điều khoản',
          type: 'checkbox',
          checkboxLabel: 'Tôi đồng ý với điều khoản sử dụng'
        },
        {
          name: 'note',
          label: 'Ghi chú',
          type: 'textarea',
          placeholder: 'Thêm ghi chú (tuỳ chọn)',
          colspan: 3,
          rows: 5
        }
      ]
    }
  ];
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern(/^[0-9]{10}$/)],
      course: ['', Validators.required],
      startDate: ['', Validators.required],
      agreeTerms: [false],
      note: ['']
    });
  }
  
  openDialog() {
    this.isDialogOpen = true;
    this.form.reset();
  }
  
  onSubmit(data: any) {
    console.log('Form data:', data);
    // Gọi API để lưu
    this.isDialogOpen = false;
  }
  
  onFieldChange(event: any) {
    console.log('Changed:', event);
  }
}

// Trong template:
<button (click)="openDialog()">Thêm học viên</button>

<app-form-dialog
  *ngIf="isDialogOpen"
  title="Thêm học viên mới"
  [sections]="sections"
  [formGroup]="form"
  [showErrors]="true"
  submitText="Lưu"
  cancelText="Hủy"
  (close)="isDialogOpen = false"
  (submit)="onSubmit($event)"
  (fieldChange)="onFieldChange($event)">
</app-form-dialog>


/* ============================================================
   12. INPUT ATTRIBUTES
   ============================================================ */

@Input() title: string;                    // Tiêu đề dialog
@Input() sections: any[];                  // Mảng sections & fields
@Input() bodyTemplate: TemplateRef<any>;   // Custom body template
@Input() columns: number = 3;              // Số cột (default 3)
@Input() formGroup: FormGroup;             // FormGroup (optional)
@Input() cancelText: string = 'Thoát';     // Text nút Cancel
@Input() submitText: string = 'Xác nhận';  // Text nút Submit
@Input() cancelIcon: string = 'bi bi-x-circle';      // Icon Cancel
@Input() submitIcon: string = 'bi bi-save';          // Icon Submit
@Input() formData: any = {};               // Data object (nếu không dùng FormGroup)
@Input() isReadOnly: boolean = false;      // Read-only mode
@Input() showErrors: boolean = true;       // Hiển thị error messages
@Input() cancelBtnClass: string;           // Custom CSS cho nút Cancel
@Input() submitBtnClass: string;           // Custom CSS cho nút Submit
@Input() autoCreateFormGroup: boolean = true;  // Tự tạo FormGroup

@Output() close = new EventEmitter<void>();              // Event khi đóng
@Output() submit = new EventEmitter<any>();              // Event khi submit
@Output() fieldChange = new EventEmitter<{fieldName, value}>();  // Event khi field thay đổi


/* ============================================================
   13. CHỈNH SỬA DỮ LIỆU CÓ SẴN
   ============================================================ */

// Nếu muốn mở dialog để chỉnh sửa dữ liệu:

editStudent(student: any) {
  this.form.patchValue(student);  // Điền dữ liệu vào form
  this.isDialogOpen = true;
}

// Hoặc dùng template-driven (không FormGroup):

sections = [
  {
    fields: [
      {
        name: 'name',
        label: 'Tên',
        type: 'text',
        value: 'John Doe'  // Giá trị mặc định
      }
    ]
  }
];


/* ============================================================
   NOTES
   ============================================================ */

✓ Hỗ trợ cả Reactive Forms và Template-driven Forms
✓ Validation tự động & error messages
✓ Read-only mode cho xem thông tin
✓ Responsive design (1 cột trên mobile)
✓ Custom templates cho field đặc biệt
✓ Accessibility (ARIA labels, focus management)
✓ File upload support
✓ Color picker support
✓ Flexible layout (colspan, per-section columns)
✓ Change tracking per field
✓ Auto-save option (dùng fieldChange event)

*/
