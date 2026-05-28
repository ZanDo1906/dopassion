import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf, NgClass } from '@angular/common';
import {FormBuilder,FormGroup,FormsModule,ReactiveFormsModule,Validators} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { VoucherService } from '../../../services/voucher';
import { GridFormDialog } from '../../../components/form-dialog/form-dialog';
import {FilterConfig,FilterDataPicker} from '../../../components/filter-data-picker/filter-data-picker';
import { iVoucher } from '../../../interfaces/voucher';
import { ConfirmDialog } from '../../../components/confirm-dialog/confirm-dialog';
import { ImportExcelDialog, ImportExcelColumn } from '../../../components/import-excel-dialog/import-excel-dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
imports: [FormsModule,ReactiveFormsModule,NgIf,NgForOf,NgClass,NgSelectModule,GridFormDialog,FilterDataPicker, ConfirmDialog, ImportExcelDialog],
templateUrl: './voucher.html',
styleUrls: ['./voucher.css'],
})

export class Voucher implements OnInit {
    showConfirmDialog = false;

    selectedVoucher: any = null;

    confirmTitle = '';

    confirmMessage = '';

  // Import Excel
  showImportDialog = false;
  importColumns: ImportExcelColumn[] = [
    { header: 'Mã Voucher', key: 'maVoucher', example: 'VC001' },
    { header: 'Tên Chương Trình', key: 'tenChuongTrinh', example: 'Giảm giá khai giảng' },
    { header: 'Đơn vị giảm', key: 'donViGiam', example: 'VNĐ' },
    { header: 'Thông số giảm', key: 'thongSo', example: '500000' },
    { header: 'Chi nhánh áp dụng', key: 'chiNhanh', example: 'CN1, CN2' },
    { header: 'Khóa học áp dụng', key: 'khoaHocApDung', example: 'LR, SW' },
  ];


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
,
{
name: 'active',
label: 'Trạng thái',
type: 'text'
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
thongSoGiam: [''],
active: ['']
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
active: item.active,
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

return normalizedSelected.every((selected) =>
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

        this.allData.flatMap((item) => {

            if (Array.isArray(item.chiNhanh)) {

                return item.chiNhanh.flatMap((branch: string) =>

                    branch
                        .split(',')
                        .map(x => x.trim())
                );

            }

            return [];

        })

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
: [],

active: item.active
? 'Đang hoạt động'
: 'Ngưng hoạt động'

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

toggleVoucherStatus(item: any): void {

  this.selectedVoucher = item;

  if (item.active) {

    this.confirmTitle =
      'Ngưng hoạt động voucher';

    this.confirmMessage =
      'Bạn có chắc muốn ngưng hoạt động voucher này không?';

  }

  else {

    this.confirmTitle =
      'Kích hoạt voucher';

    this.confirmMessage =
      'Bạn có chắc muốn kích hoạt lại voucher này không?';

  }

  this.showConfirmDialog = true;

}
confirmToggleVoucherStatus(): void {

  if (!this.selectedVoucher) {
    return;
  }

  const payload = {

    ...this.selectedVoucher,

    active: !this.selectedVoucher.active

  };

  this.voucherService
    .updateVoucher(
      this.selectedVoucher._id,
      payload
    )
    .subscribe({

      next: () => {

        this.selectedVoucher.active =
          !this.selectedVoucher.active;

        this.filteredData = [...this.allData];

        this.showConfirmDialog = false;

        this.selectedVoucher = null;

      },

      error: (error) => {

        console.error(
          'Lỗi cập nhật trạng thái voucher',
          error
        );

      }

    });

}
closeConfirmDialog(): void {

  this.showConfirmDialog = false;

  this.selectedVoucher = null;

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

  exportExcel() {
    const data = this.filteredData;
    if (!data || data.length === 0) {
      alert('Không có dữ liệu để xuất!');
      return;
    }

    const excelData = data.map((item: any, index: number) => ({
      'STT': index + 1,
      'Mã voucher': item.maVoucher ?? '',
      'Tên chương trình': item.tenChuongTrinh ?? '',
      'Khóa học áp dụng': Array.isArray(item.khoaHocApDung) ? item.khoaHocApDung.join(', ') : (item.khoaHocApDung ?? ''),
      'Đơn vị giảm': item.donViGiam ?? '',
      'Thông số giảm': item.thongSoGiam ?? 0,
      'Chi nhánh áp dụng': Array.isArray(item.chiNhanh) ? item.chiNhanh.join(', ') : (item.chiNhanh ?? ''),
      'Trạng thái': item.active ? 'Đang hoạt động' : 'Ngưng hoạt động',
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const headers = Object.keys(excelData[0]);
    worksheet['!cols'] = headers.map(key => {
      const maxLen = Math.max(
        key.length,
        ...excelData.map(row => `${(row as any)[key] ?? ''}`.length)
      );
      return { wch: maxLen + 2 };
    });

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách voucher');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, `DanhSachVoucher_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  openImportDialog(): void {
    this.showImportDialog = true;
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  onImportExcel(data: any[]): void {
    if (!data || data.length === 0) {
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    data.forEach((row, index) => {
      const payload: any = {
        stt: this.allData.length + index + 1,
        maVoucher: `${row.maVoucher ?? ''}`.trim(),
        tenChuongTrinh: `${row.tenChuongTrinh ?? ''}`.trim(),
        donViGiam: `${row.donViGiam ?? 'VNĐ'}`.trim(),
        thongSo: Number(row.thongSo) || 0,
        chiNhanh: typeof row.chiNhanh === 'string'
          ? row.chiNhanh.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        khoaHocApDung: typeof row.khoaHocApDung === 'string'
          ? row.khoaHocApDung.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        active: true
      };

      this.voucherService.addVoucher(payload).subscribe({
        next: () => {
          successCount++;
          if (successCount + errorCount === data.length) {
            alert(`Nhập thành công ${successCount}/${data.length} voucher.`);
            this.loadVouchers();
            this.showImportDialog = false;
          }
        },
        error: (err) => {
          errorCount++;
          console.error(`Lỗi nhập voucher dòng ${index + 1}:`, err);
          if (successCount + errorCount === data.length) {
            alert(`Nhập thành công ${successCount}/${data.length} voucher. Lỗi: ${errorCount} dòng.`);
            this.loadVouchers();
            this.showImportDialog = false;
          }
        }
      });
    });
  }
}