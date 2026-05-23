import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog implements OnChanges, OnDestroy {
  @Input() title: string = 'Xác nhận';
  @Input() message: string = 'Bạn có chắc chắn muốn thực hiện hành động này?';
  @Input() confirmText: string = 'Xác nhận';
  @Input() cancelText: string = 'Hủy';
  @Input() confirmIcon: string = 'bi bi-check-circle';
  @Input() cancelIcon: string = 'bi bi-x-circle';
  @Input() isOpen: boolean = false;
  @Input() confirmBtnClass: string = 'btn-primary';
  @Input() cancelBtnClass: string = 'btn-secondary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      this.toggleBodyScroll(this.isOpen);
    }
  }

  ngOnDestroy(): void {
    this.toggleBodyScroll(false);
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private toggleBodyScroll(lock: boolean): void {
    if (lock) {
      document.body.style.overflow = 'hidden';
    } else {
      // Chỉ mở lại scroll nếu không còn dialog nào khác đang mở
      setTimeout(() => {
        const hasOtherOverlay = document.querySelectorAll('.confirm-dialog-overlay, .dialog-backdrop, .stepper-backdrop').length;
        if (hasOtherOverlay <= 1) {
          document.body.style.overflow = '';
        }
      });
    }
  }
}
