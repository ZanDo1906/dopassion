import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ImportExcelColumn {
  /** Header label shown in the Excel template */
  header: string;
  /** The property name to map the column value to */
  key: string;
  /** Example value shown in the template (optional) */
  example?: string;
}

@Component({
  selector: 'app-import-excel-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-excel-dialog.html',
  styleUrl: './import-excel-dialog.css',
})
export class ImportExcelDialog implements OnChanges, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Nhập Excel';
  @Input() templateFileName: string = 'Template.xlsx';
  @Input() sheetName: string = 'Sheet1';
  @Input() columns: ImportExcelColumn[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() imported = new EventEmitter<any[]>();

  selectedFile: File | null = null;
  fileName: string = '';
  errorMessage: string = '';
  previewData: any[] = [];
  isUploading: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleBodyScroll(this.isOpen);
      if (this.isOpen) {
        this.resetState();
      }
    }
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  downloadTemplate(): void {
    const headers = this.columns.map(c => c.header);
    const exampleRow: Record<string, string> = {};
    this.columns.forEach(c => {
      exampleRow[c.header] = c.example ?? '';
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([exampleRow]);

    // Auto-fit column widths
    worksheet['!cols'] = headers.map(h => ({
      wch: Math.max(h.length, (exampleRow[h] ?? '').length) + 4
    }));

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);

    const buffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    saveAs(blob, this.templateFileName);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      this.errorMessage = 'Vui lòng chọn file Excel (.xlsx hoặc .xls)';
      this.selectedFile = null;
      this.fileName = '';
      return;
    }

    this.selectedFile = file;
    this.fileName = file.name;
    this.errorMessage = '';
    this.previewData = [];
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Vui lòng chọn file để nhập!';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          this.errorMessage = 'File Excel không có dữ liệu!';
          this.isUploading = false;
          return;
        }

        // Map headers to keys
        const mappedData = jsonData.map(row => {
          const mapped: Record<string, any> = {};
          this.columns.forEach(col => {
            mapped[col.key] = row[col.header] ?? '';
          });
          return mapped;
        });

        this.previewData = mappedData.slice(0, 5);
        this.imported.emit(mappedData);
        this.isUploading = false;
      } catch (err) {
        this.errorMessage = 'Lỗi đọc file Excel. Vui lòng kiểm tra lại định dạng file.';
        this.isUploading = false;
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }

  onClose(): void {
    this.resetState();
    this.close.emit();
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.previewData = [];
    this.errorMessage = '';
  }

  private resetState(): void {
    this.selectedFile = null;
    this.fileName = '';
    this.errorMessage = '';
    this.previewData = [];
    this.isUploading = false;
  }

  private toggleBodyScroll(lock: boolean): void {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      setTimeout(() => {
        const hasOtherOverlay = document.querySelectorAll('.import-excel-overlay, .confirm-dialog-overlay, .dialog-backdrop').length;
        if (hasOtherOverlay <= 1) {
          document.body.style.overflow = '';
        }
      });
    }
  }
}
