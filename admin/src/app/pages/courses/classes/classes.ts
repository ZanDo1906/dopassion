import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Class } from '../../../services/class';
import { iClass } from '../../../interfaces/class';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, GridFormDialog],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit {
  classes: iClass[] = [];

  isDialogOpen = false;
  dialogSections = [
    {
      title: 'I. Thông tin Khóa học',
      fields: [
        { label: 'Mã lớp', name: 'Mã lớp', type: 'text', disabled: true },
        { label: 'Tên lớp', name: 'Tên lớp', type: 'text', required: true },
        { label: 'Khung giờ', name: 'Khung giờ', type: 'text', required: true },
        { label: 'Ngày bắt đầu', name: 'Ngày bắt đầu', type: 'date', required: true },
        { label: 'Ngày kết thúc', name: 'Ngày kết thúc', type: 'date', required: true },
        { label: 'Mã khóa', name: 'Mã khóa', type: 'text' },
        { label: 'Tên khóa học', name: 'Tên khóa học', type: 'text' },
        { label: 'STT', name: 'STT', type: 'number' }
      ]
    },
    {
      title: 'II. Thông tin Giáo viên',
      fields: [
        { label: 'Chi nhánh', name: 'Chi nhánh', type: 'select', required: true, options: [{ label: 'Chọn chi nhánh...', value: '' }] },
        { label: 'Giảng viên', name: 'Giảng viên', type: 'select', required: true, options: [{ label: 'Chọn giảng viên...', value: '' }] },
        { label: 'Mã nhân viên', name: 'Mã nhân viên', type: 'text', disabled: true }
      ]
    }
  ];

  constructor(private classService: Class) { }

  ngOnInit() {
    this.classService.getClass().subscribe((data) => {
      this.classes = data;
    });
  }

  openDialog() {
    this.isDialogOpen = true;
  }

  closeDialog() {
    this.isDialogOpen = false;
  }

  onSubmitDialog(data: any) {
    console.log('Dữ liệu lớp học được thêm:', data);
    this.isDialogOpen = false;
  }
}
