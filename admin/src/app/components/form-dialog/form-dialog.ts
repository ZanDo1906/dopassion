import { Component, EventEmitter, Input, Output, OnChanges, DoCheck, SimpleChanges, TemplateRef, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ],
  templateUrl: './form-dialog.html',
  styleUrls: ['./form-dialog.css']
})
export class FormDialogComponent implements OnChanges, DoCheck {

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @Input() title: string = '';
  @Input() sections: any[] = [];
  @Input() bodyTemplate: TemplateRef<any> | null = null;
  @Input() columns: number = 3;
  @Input() formGroup: FormGroup | null = null;
  @Input() cancelText: string = 'Thoát';
  @Input() submitText: string = 'Xác nhận';
  @Input() cancelIcon: string = 'bi bi-x-circle';
  @Input() submitIcon: string = 'bi bi-save';
  @Input() formData: any = {};
  @Input() isReadOnly: boolean = false;
  @Input() showErrors: boolean = true;
  @Input() submitBtnClass: string = '';
  @Input() cancelBtnClass: string = '';
  @Input() autoCreateFormGroup: boolean = true;
  @Input() isViewOnly: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<any>();
  @Output() fieldChange = new EventEmitter<{ fieldName: string; value: any }>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sections'] && !this.formGroup) {
      if (this.autoCreateFormGroup) {
        this.createFormGroupFromSections();
      } else {
        this.syncFormDataFromSections();
      }
    }
  }

  ngDoCheck(): void {
    if (this.formGroup && this.formData) {
      Object.keys(this.formGroup.controls).forEach(key => {
        const control = this.formGroup!.get(key);
        if (control) {
          const parentValue = this.formData[key];
          if (parentValue !== undefined && control.value !== parentValue) {
            const isBothNaN = Number.isNaN(control.value) && Number.isNaN(parentValue);
            if (!isBothNaN) {
              const activeElement = document.activeElement;
              const isFocused = activeElement && (activeElement.id === key || activeElement.getAttribute('formcontrolname') === key);
              if (!isFocused) {
                control.setValue(parentValue, { emitEvent: false });
              }
            }
          }
        }
      });
    }
  }

  private createFormGroupFromSections(): void {
    const formControls: any = {};

    for (const section of this.sections ?? []) {
      for (const field of section.fields ?? []) {
        const value = field.value ?? this.formData[field.name] ?? null;
        const validators = field.validators || [];
        formControls[field.name] = new FormControl(
          { value, disabled: field.disabled || false },
          validators
        );
      }
    }

    this.formGroup = new FormGroup(formControls);
  }

  private syncFormDataFromSections(): void {
    const nextFormData: any = {};

    for (const section of this.sections ?? []) {
      for (const field of section.fields ?? []) {
        nextFormData[field.name] = field.value ?? this.formData[field.name] ?? this.getDefaultValue(field.type);
      }
    }

    this.formData = nextFormData;
  }

  private getDefaultValue(fieldType: string): any {
    switch (fieldType) {
      case 'checkbox':
      case 'radio':
        return false;
      case 'number':
        return 0;
      case 'date':
      case 'datetime-local':
      case 'time':
        return '';
      default:
        return '';
    }
  }

  onFieldChange(fieldName: string, value: any): void {
    let fieldType = 'text';
    if (this.sections) {
      for (const section of this.sections) {
        if (section.fields) {
          const field = section.fields.find((f: any) => f.name === fieldName);
          if (field) {
            fieldType = field.type;
            break;
          }
        }
      }
    }

    let processedValue = value;
    if (fieldType === 'number') {
      processedValue = value === '' || value === null || value === undefined ? null : Number(value);
      if (processedValue !== null && Number.isNaN(processedValue)) {
        processedValue = value;
      }
    }

    this.formData[fieldName] = processedValue;
    this.fieldChange.emit({ fieldName, value: processedValue });
  }

  onSubmit(): void {
    if (this.formGroup && this.formGroup.invalid) {
      Object.keys(this.formGroup.controls).forEach(key => {
        this.formGroup?.get(key)?.markAsTouched();
      });
      // Apply visual error classes to .form-group elements so template-based dialogs show errors
      this.applyHasErrorClasses();
      return;
    }
    this.submit.emit(this.formGroup ? this.formGroup.getRawValue() : this.formData);
  }

  /**
   * Add/remove `has-error` class on .form-group elements that contain the form control
   * This ensures templates that provide their own form HTML still get the same error styling
   */
  private applyHasErrorClasses(): void {
    if (!this.formGroup || !this.elementRef) return;

    Object.keys(this.formGroup.controls).forEach((name) => {
      const control = this.formGroup!.get(name);
      // Query for element with formControlName (DOM attribute lowercased)
      const selector = `[formcontrolname="${name}"]`;
      const el = this.elementRef.nativeElement.querySelector(selector) as HTMLElement | null;
      if (!el) return;

      const formGroupEl = el.closest('.form-group') as HTMLElement | null;
      if (!formGroupEl) return;

      const shouldHaveError = !!(control && control.invalid && (control.touched || control.dirty));
      if (shouldHaveError) {
        formGroupEl.classList.add('has-error');
      } else {
        formGroupEl.classList.remove('has-error');
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    if (!this.formGroup || !this.showErrors) return null;

    const control = this.formGroup.get(fieldName);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Trường này là bắt buộc';
      if (control.errors?.['email']) return 'Email không hợp lệ';
      if (control.errors?.['min']) return `Giá trị tối thiểu là ${control.errors['min'].min}`;
      if (control.errors?.['max']) return `Giá trị tối đa là ${control.errors['max'].max}`;
      if (control.errors?.['minlength']) return `Tối thiểu ${control.errors['minlength'].requiredLength} ký tự`;
      if (control.errors?.['maxlength']) return `Tối đa ${control.errors['maxlength'].requiredLength} ký tự`;
      if (control.errors?.['pattern']) return 'Định dạng không hợp lệ';
      return 'Dữ liệu không hợp lệ';
    }
    return null;
  }

  hasError(fieldName: string): boolean {
    if (!this.formGroup) return false;
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Helper methods to safely extract values from events
  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value ?? '';
  }

  getCheckboxChecked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked ?? false;
  }

  getRadioValue(event: Event): string {
    return (event.target as HTMLInputElement).value ?? '';
  }

  getSelectValue(event: Event): string {
    return (event.target as HTMLSelectElement).value ?? '';
  }

  getTextareaValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value ?? '';
  }

  getFileList(event: Event): FileList | null {
    return (event.target as HTMLInputElement).files ?? null;
  }

  onMultiSelectChange(fieldName: string, value: any, event: Event): void {

  if (!this.formGroup) return;

  const checked = (event.target as HTMLInputElement).checked;

  const control = this.formGroup.get(fieldName);

  let currentValues = control?.value || [];

  if (!Array.isArray(currentValues)) {
    currentValues = [];
  }

  if (checked) {
    currentValues = [...currentValues, value];
  } else {
    currentValues = currentValues.filter((x: any) => x !== value);
  }

  control?.setValue(currentValues);

  this.onFieldChange(fieldName, currentValues);
}
}

export { FormDialogComponent as GridFormDialog };
export { FormDialogComponent as FormDialog };