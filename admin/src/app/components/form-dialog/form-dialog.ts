import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './form-dialog.html',
  styleUrls: ['./form-dialog.css']
})
export class FormDialogComponent implements OnChanges {

  @Input() title: string = '';

  @Input() sections: any[] = [];

  @Input() bodyTemplate: TemplateRef<any> | null = null;

  @Input() columns: number = 3;

  @Input() formGroup: FormGroup | null = null;

  @Input() cancelText: string = 'Thoát';

  @Input() submitText: string = 'Xác nhận';

  @Input() cancelIcon: string = 'bi bi-x-circle';

  @Input() submitIcon: string = 'bi bi-save';

  @Output() close = new EventEmitter<void>();

  @Output() submit = new EventEmitter<any>();

  @Input() formData: any = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] && !this.formGroup) {
      this.syncFormDataFromSections();
    }
  }

  private syncFormDataFromSections(): void {
    const nextFormData: any = {};

    for (const section of this.sections ?? []) {
      for (const field of section.fields ?? []) {
        nextFormData[field.name] = field.value ?? this.formData[field.name] ?? '';
      }
    }

    this.formData = nextFormData;
  }

  onSubmit() {
    this.submit.emit(this.formGroup ? this.formGroup.getRawValue() : this.formData);
  }

}

export { FormDialogComponent as GridFormDialog };
export { FormDialogComponent as FormDialog };