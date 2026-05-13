import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './form-dialog.html',
  styleUrls: ['./form-dialog.css']
})
export class GridFormDialog {

  @Input() title: string = '';

  @Input() sections: any[] = [];

  @Input() columns: number = 3;

  @Output() close = new EventEmitter<void>();

  @Output() submit = new EventEmitter<any>();

  @Input() formData: any = {};

  onSubmit() {
    this.submit.emit(this.formData);
  }

}