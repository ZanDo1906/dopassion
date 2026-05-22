import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import {
FormBuilder,
FormGroup,
FormsModule,
ReactiveFormsModule,
Validators
} from '@angular/forms';

import { NgSelectModule } from '@ng-select/ng-select';

import { VoucherService } from '../../../services/voucher';

import { GridFormDialog } from '../../../components/form-dialog/form-dialog';

import {
FilterConfig,
FilterDataPicker
} from '../../../components/filter-data-picker/filter-data-picker';

import { iVoucher } from '../../../interfaces/voucher';

const BRANCHES = [
  { label: 'Chi nhánh 1', value: 'CN1' },
  { label: 'Chi nhánh 2', value: 'CN2' },
  { label: 'Chi nhánh 3', value: 'CN3' }
];

const COURSE_OPTIONS = [
  { label: 'LR', value: 'LR' },
  { label: 'SW', value: 'SW' },
  { label: 'TOEIC', value: 'TOEIC' }
];

@Component({
selector: 'app-voucher',
standalone: true,
imports: [
FormsModule,
ReactiveFormsModule,
NgIf,
NgForOf,
NgSelectModule,
GridFormDialog,
FilterDataPicker
],
templateUrl: './voucher.html',
styleUrls: ['./voucher.css'],
})

export class Voucher implements OnInit {

filterConfig: FilterConfig[] = [
{ key: 'maVoucher', label: 'Mã Voucher', type: 'text' },
{ key: 'tenChuongTrinh', label: 'Tên Chương Trình', type: 'text' },
{
key: 'khoaHocApDung',
label: 'Khóa học áp dụng',
type: 'select',
options: []
},
{ key: 'maLop', label: 'Mã Lớp', type: 'text' },
{
key: 'chiNhanh',
label: 'Chi nhánh',
type: 'multi-select',
options: []
},
{
key: 'active',
label: 'Trạng thái',
type: 'multi-select',
options: [
{ label: 'Đang hoạt động', value: true },
{ label: 'Ngưng hoạt động', value: false }
]
}
];

roles: iVoucher[] = [];

allData: any[] = [];
filteredData: any[] = [];
paginatedData: any[] = [];

loading = true;
errorMessage = '';

showAddDialog = false;

dialogMode: 'add' | 'view' | 'edit' = 'add';

editingIndex: number | null = null;

currentPage = 1;

itemsPerPage = 10;

pageSizeOptions = [10, 20, 50];

voucherForm!: FormGroup;

detailForm!: FormGroup;

branches = BRANCHES;

courseOptions = COURSE_OPTIONS;

voucherFormSections = [
{
title: 'THÔNG TIN VOUCHER',
fields: [
{
name: 'maVoucher',
label: 'Mã Voucher',
type: 'text',
required: true
},
{
name: 'tenChuongTrinh',
label: 'Tên Chương Trình',
type: 'text',
required: true
},
{
name: 'chiNhanh',
label: 'Chi nhánh áp dụng',
type: 'multi-select',
options: BRANCHES
},
{
name: 'khoaHocApDung',
label: 'Khóa học áp dụng',
type: 'multi-select',
options: COURSE_OPTIONS
}
]
},
{
title: 'CẤU HÌNH GIẢM GIÁ',
fields: [
{
name: 'donViGiam',
label: 'Đơn vị giảm',
type: 'select',
options: [
{
label: 'Phần trăm (%)',
value: 'Phần trăm'
},
{
label: 'Số tiền (VNĐ)',
value: 'VNĐ'
}
]
},
{
name: 'thongSoGiam',
label: 'Thông số giảm',
type: 'number',
required: true
}
]
}
];

constructor(
private fb: FormBuilder,
private voucherService: VoucherService
) { }

ngOnInit(): void {

this.initForm();

this.loadVouchers();

}

initForm(): void {

this.voucherForm = this.fb.group({
maVoucher: ['', [Validators.required]],
tenChuongTrinh: ['', [Validators.required]],
donViGiam: ['VNĐ', [Validators.required]],
thongSoGiam: [0, [Validators.required, Validators.min(0)]],
chiNhanh: [[]],
khoaHocApDung: [[]]
});

this.detailForm = this.fb.group({
maVoucher: [''],
tenChuongTrinh: [''],
chiNhanh: [[]],
khoaHocApDung: [[]],
donViGiam: [''],
thongSoGiam: ['']
});

}

loadVouchers(): void {

this.loading = true;

this.voucherService.getVoucher().subscribe({

next: (items: any[]) => {

this.allData = (items || []).map((item) => ({

_id: item._id,

stt: item.stt,

maVoucher: item.maVoucher,

tenChuongTrinh: item.tenChuongTrinh,

donViGiam: item.donViGiam,

thongSoGiam: item.thongSo,

maLop: '',

chiNhanh: Array.isArray(item.chiNhanh)
    ? item.chiNhanh
    : item.chiNhanh
        ? [item.chiNhanh]
        : [],

khoaHocApDung: Array.isArray(item.khoaHocApDung)
    ? item.khoaHocApDung
    : item.khoaHocApDung
        ? [item.khoaHocApDung]
        : [],

}));

this.filteredData = [...this.allData];

this.syncFilterOptions();

this.currentPage = 1;

this.updatePagination();

this.loading = false;

console.log(
'Dữ liệu voucher:',
this.allData
);

},

error: (error) => {

console.error(
'Lỗi load voucher:',
error
);

this.errorMessage =
'Không thể tải dữ liệu voucher';

this.loading = false;

}

});

}

handleSearch(filterValues: any): void {

this.filteredData = this.allData.filter((item) => {

return Object.keys(filterValues || {}).every((key) => {

const filterValue = filterValues[key];

const itemValue = item[key];

if (
Array.isArray(filterValue) &&
filterValue.length === 0
) {
return true;
}

if (
!Array.isArray(filterValue) &&
(`${filterValue ?? ''}`.trim() === '')
) {
return true;
}

if (
Array.isArray(filterValue) &&
filterValue.length > 0
) {

const normalizedSelected = filterValue
.map((value) =>
`${value ?? ''}`.trim().toLowerCase()
)
.filter(Boolean);

if (Array.isArray(itemValue)) {

const normalizedItemValues = itemValue
.map((value) =>
`${value ?? ''}`.trim().toLowerCase()
)
.filter(Boolean);

return normalizedSelected.some((selected) =>
normalizedItemValues.includes(selected)
);

}

const normalizedItemValue =
`${itemValue ?? ''}`.trim().toLowerCase();

return normalizedSelected.includes(
normalizedItemValue
);

}

const normalizedFilterText =
`${filterValue ?? ''}`.trim().toLowerCase();

if (Array.isArray(itemValue)) {

const normalizedItemText = itemValue
.map((value) =>
`${value ?? ''}`.trim().toLowerCase()
)
.join(' ');

return normalizedItemText.includes(
normalizedFilterText
);

}

const normalizedItemValue =
`${itemValue ?? ''}`.trim().toLowerCase();

return normalizedItemValue.includes(
normalizedFilterText
);

});

});

this.currentPage = 1;

this.updatePagination();

}

handleReset(): void {

this.filteredData = [...this.allData];

this.currentPage = 1;

this.updatePagination();

}

get totalPages(): number {

return Math.max(
1,
Math.ceil(
this.filteredData.length /
this.itemsPerPage
)
);

}

get paginatedVouchers(): any[] {

return this.paginatedData;

}

get pages(): number[] {

return Array.from(
{ length: this.totalPages },
(_, i) => i + 1
);

}

changePage(page: number): void {

if (
page < 1 ||
page > this.totalPages
) {
return;
}

this.currentPage = page;

this.updatePagination();

}

changePageSize(event: Event): void {

const value =
(event.target as HTMLSelectElement).value;

this.itemsPerPage = Number(value);

this.currentPage = 1;

this.updatePagination();

}

updatePagination(): void {

const start =
(this.currentPage - 1) *
this.itemsPerPage;

const end =
start + this.itemsPerPage;

this.paginatedData =
this.filteredData.slice(start, end);

}

private syncFilterOptions(): void {

const courseOptions = Array.from(
new Set(
this.allData.flatMap((item) =>
Array.isArray(item.khoaHocApDung)
? item.khoaHocApDung
: [item.khoaHocApDung]
)
)
)
.filter(Boolean)
.map((value) => ({
label: value,
value
}));

const branchOptions = Array.from(
new Set(
this.allData.flatMap((item) =>
Array.isArray(item.chiNhanh)
? item.chiNhanh
: []
)
)
)
.filter(Boolean)
.map((value) => ({
label: value,
value
}));

this.filterConfig = this.filterConfig.map((field) => {

if (field.key === 'khoaHocApDung') {

return {
...field,
options:
courseOptions.length > 0
? courseOptions
: this.courseOptions
};

}

if (field.key === 'chiNhanh') {

return {
...field,
options:
branchOptions.length > 0
? branchOptions
: this.branches
};

}

return field;

});

}

openAddDialog(): void {

this.dialogMode = 'add';

this.editingIndex = null;

this.voucherForm.enable();

this.voucherForm.reset({

maVoucher: '',

tenChuongTrinh: '',

chiNhanh: [],

donViGiam: 'VNĐ',

thongSoGiam: 0,

khoaHocApDung: []

});

this.showAddDialog = true;

}

viewVoucherDetail(item: any): void {

this.detailForm.enable();

this.detailForm.patchValue({

maVoucher: item.maVoucher,

tenChuongTrinh: item.tenChuongTrinh,

donViGiam: item.donViGiam,

thongSoGiam: item.thongSoGiam,

chiNhanh: Array.isArray(item.chiNhanh)
? item.chiNhanh
: [],

khoaHocApDung: Array.isArray(item.khoaHocApDung)
? item.khoaHocApDung
: []

});

this.detailForm.disable();

this.dialogMode = 'view';

this.showAddDialog = true;

}

editVoucher(item: any): void {

this.dialogMode = 'edit';

this.editingIndex =
this.allData.findIndex(
(x) => x._id === item._id
);

this.voucherForm.enable();

this.voucherForm.patchValue({

maVoucher: item.maVoucher,

tenChuongTrinh: item.tenChuongTrinh,

donViGiam: item.donViGiam,

thongSoGiam: item.thongSoGiam,

chiNhanh: Array.isArray(item.chiNhanh)
    ? item.chiNhanh
    : [],

khoaHocApDung: Array.isArray(item.khoaHocApDung)
    ? item.khoaHocApDung
    : [],

});

this.showAddDialog = true;

}

closeDialog(): void {

this.showAddDialog = false;

}

onSaveVoucher(): void {

if (!this.voucherForm.valid) {
return;
}

const formValue = this.voucherForm.value;

const payload = {

stt:
this.dialogMode === 'add'
? this.allData.length + 1
: this.allData[this.editingIndex!]?.stt,

maVoucher: formValue.maVoucher,

tenChuongTrinh:
formValue.tenChuongTrinh,

donViGiam:
formValue.donViGiam,

thongSo:
Number(formValue.thongSoGiam),

chiNhanh: formValue.chiNhanh || [],

khoaHocApDung: formValue.khoaHocApDung || [],

active: true

};

console.log('Payload gửi API:', payload);



// ================= ADD =================

if (this.dialogMode === 'add') {

this.voucherService
.addVoucher(payload as any)
.subscribe({

next: (response) => {

console.log(
'Thêm voucher thành công:',
response
);

this.loadVouchers();

this.showAddDialog = false;

},

error: (error) => {

console.error(
'Lỗi thêm voucher:',
error
);

}

});

return;

}



// ================= EDIT =================

if (
this.dialogMode === 'edit' &&
this.editingIndex !== null
) {

const id =
this.allData[this.editingIndex]._id;

this.voucherService
.updateVoucher(id, payload)
.subscribe({

next: (response) => {

console.log(
'Cập nhật voucher thành công:',
response
);

this.loadVouchers();

this.showAddDialog = false;

this.editingIndex = null;

},

error: (error) => {

console.error(
'Lỗi cập nhật voucher:',
error
);

}

});

}

}

}