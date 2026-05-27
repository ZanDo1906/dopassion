import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import 'iconify-icon';

// Services
import { Feedback as FeedbackService } from '../../services/feedback';
import { Class as ClassService } from '../../services/class';
import { RegistrationService } from '../../services/registration';
import { NotificationService } from '../../services/notification.service';

// Interfaces
export interface Review {
  id: number;
  author: string;
  avatar: string;
  date: string;
  rating: number;
  course: string;
  courseCode: string;
  content: string;
  helpful: number;
  hasReply: boolean;
  reply?: string;
  replyAuthor?: string;
}

export interface RatingDistribution {
  stars: number;
  percentage: number;
  count: number;
}

export interface DetailedRating {
  category: string;
  rating: number;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews implements OnInit {
  // Make Math available in template
  Math = Math;

  // Dynamic Rating Stats
  averageRating = 5.0;
  totalReviews = 0;
  fiveStarPercentage = 0;
  responseRatePercentage = 0;
  categories: string[] = ['TOEIC', 'IELTS', 'Giao tiếp', 'Speaking'];

  // Rating Data
  ratingDistribution: RatingDistribution[] = [
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 }
  ];

  detailedRatings: DetailedRating[] = [
    { category: 'Giảng viên', rating: 5 },
    { category: 'Nội dung khóa học', rating: 5 },
    { category: 'Hỗ trợ', rating: 5 }
  ];

  // Reviews Data arrays
  allFeedbacks: any[] = [];
  filteredFeedbacks: any[] = [];
  reviews: any[] = [];
  visibleLimit = 3;

  // Filter States
  selectedClass = '';
  selectedRating = '';
  selectedSort = 'newest';
  searchQuery = '';
  formRating = 5;
  isLoggedIn: boolean = false;
  customerCode: string = '';
  showLoginPromptModal: boolean = false;

  // Reactive Form
  reviewFormGroup: FormGroup;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private classService: ClassService,
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.reviewFormGroup = this.fb.group({
      studentName: ['', Validators.required],
      class: [''],
      rating: [5, Validators.required],
      content: ['', [Validators.required, Validators.minLength(20)]],
      agreeToTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {

  const userData = localStorage.getItem('currentUser');

  if (userData) {

    this.isLoggedIn = true;

    const user = JSON.parse(userData);

    this.customerCode =
      user.maKh ||
      user.maKhachHang ||
      '';

    this.reviewFormGroup.patchValue({

      studentName:
        user.tenKhachHang ||
        user.fullName ||
        ''

    });

    this.loadRegisteredClasses(this.customerCode);

  } else {

    this.loadClasses();

  }

  this.loadFeedbacks();

}

  loadClasses() {
    this.classService.getClasses().subscribe({
      next: (data: any[]) => {
        const classNames = data.map(c => c.tenLop).filter(Boolean);
        const courseNames = data.map(c => c.tenKhoaHoc).filter(Boolean);
        const distinct = Array.from(new Set([...classNames, ...courseNames]));
        if (distinct.length > 0) {
          this.categories = distinct;
        } else {
          this.categories = ['TOEIC', 'IELTS', 'Giao tiếp', 'Speaking'];
        }
      },
      error: (err) => {
        console.error('Không thể tải danh sách lớp học:', err);
        this.categories = ['TOEIC', 'IELTS', 'Giao tiếp', 'Speaking'];
      }
    });
  }
  loadRegisteredClasses(maKh: string) {
  this.registrationService.getRegistrations().subscribe({
    next: (registrations: any[]) => {
      const myRegistrations = registrations.filter(
        r => r.maKh === maKh
      );
      this.classService.getClasses().subscribe({
        next: (classList: any[]) => {
          const myClasses = myRegistrations.map(reg => {
            const classInfo = classList.find(
              c => c.maLop === reg.maLop
            );
            return (
              classInfo?.tenLop ||
              reg.tenLopHoc
            );
          });
          this.categories = Array.from(
            new Set(myClasses.filter(Boolean))
          );
        },

        error: (err) => {

          console.error('Lỗi load class:', err);

        }

      });

    },

    error: (err) => {

      console.error('Lỗi registration:', err);

    }

  });

}

  loadFeedbacks() {
    this.feedbackService.getFeedback().subscribe({
      next: (data: any[]) => {
        this.allFeedbacks = data
          .filter(item => {
            // Lọc bỏ những phản hồi có trạng thái Đã ẩn hoặc Từ chối
            return item.trangThai !== 'Đã ẩn' && item.trangThai !== 'Từ chối';
          })
          .map((item, index) => {
            let parsedDate = '';
            if (item.ngayDanhGia) {
              const d = new Date(item.ngayDanhGia);
              if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                parsedDate = `${day}/${month}/${year}`;
              } else {
                parsedDate = String(item.ngayDanhGia);
              }
            }

            const author = item.tenKhachHang || 'Học viên ẩn danh';
            const nameParts = author.split(' ');
            const initials = nameParts.length > 1 
              ? (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
              : author.substring(0, 2).toUpperCase();
            
            const colors = ['ef4444', 'f97316', '3b82f6', '10b981', '8b5cf6'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${randomColor}&color=fff`;

            return {
              id: index + 1,
              _id: item._id,
              author: author,
              avatar: avatar,
              date: parsedDate,
              rawDate: item.ngayDanhGia || new Date().toISOString(),
              rating: item.soSao || 5,
              course: item.tenLopHoc || 'Khóa học',
              courseCode: item.maDangKy || 'Mã lớp',
              content: item.noiDungDanhGia || '',
              helpful: item.helpful || 0,
              hasReply: false
            };
          });

        this.calculateStats();
        this.applyClientFilters();
      },
      error: (err) => {
        console.error('Không thể tải đánh giá từ backend:', err);
      }
    });
  }

  calculateStats() {
    const total = this.allFeedbacks.length;
    this.totalReviews = total;

    if (total > 0) {
      const sum = this.allFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      this.averageRating = Math.round((sum / total) * 10) / 10;

      const fiveStars = this.allFeedbacks.filter(r => r.rating === 5).length;
      this.fiveStarPercentage = Math.round((fiveStars / total) * 100);

      this.ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
        const count = this.allFeedbacks.filter(r => r.rating === stars).length;
        const percentage = Math.round((count / total) * 100);
        return { stars, percentage, count };
      });
    } else {
      this.averageRating = 5.0;
      this.fiveStarPercentage = 100;
      this.ratingDistribution = [
        { stars: 5, percentage: 0, count: 0 },
        { stars: 4, percentage: 0, count: 0 },
        { stars: 3, percentage: 0, count: 0 },
        { stars: 2, percentage: 0, count: 0 },
        { stars: 1, percentage: 0, count: 0 }
      ];
    }

    this.responseRatePercentage = 0;
  }

  applyClientFilters() {
    let result = [...this.allFeedbacks];

    // Lọc theo lớp học
    if (this.selectedClass) {
      result = result.filter(r => r.course === this.selectedClass);
    }

    // Lọc theo số sao
    if (this.selectedRating) {
      result = result.filter(r => Number(r.rating) === Number(this.selectedRating));
    }

    // Lọc theo tìm kiếm từ khóa
    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        (r.author && r.author.toLowerCase().includes(q)) || 
        (r.content && r.content.toLowerCase().includes(q)) ||
        (r.course && r.course.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    if (this.selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());
    } else if (this.selectedSort === 'oldest') {
      result.sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());
    } else if (this.selectedSort === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (this.selectedSort === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    this.filteredFeedbacks = result;
    this.reviews = this.filteredFeedbacks.slice(0, this.visibleLimit);
  }

  // Methods
  setRating(rating: number): void {
    this.formRating = rating;
    this.reviewFormGroup.patchValue({ rating });
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.ceil(rating))
      .fill(0)
      .map((_, i) => i + 1);
  }

  onSubmitReview(): void {
    if (this.reviewFormGroup.valid) {
      const formValues = this.reviewFormGroup.value;
      const maDanhGia = 'DG' + Math.floor(100000 + Math.random() * 900000);
      const maDangKy = 'DK' + Math.floor(100000 + Math.random() * 900000);

      const newFeedback: any = {
        stt: this.allFeedbacks.length + 1,
        maDanhGia: maDanhGia,
        maDangKy: maDangKy,
        tenKhachHang: formValues.studentName,
        tenLopHoc: formValues.class || 'Chưa chọn lớp',
        noiDungDanhGia: formValues.content,
        soSao: Number(formValues.rating),
        ngayDanhGia: new Date().toISOString(),
        trangThai: 'Đã ẩn'
      };

      this.feedbackService.addFeedback(newFeedback).subscribe({
        next: () => {
          this.notification.show('Thành công', 'Đánh giá của bạn sẽ được kiểm duyệt trước khi công bố.', 'success');
          this.reviewFormGroup.reset({
            studentName: this.isLoggedIn ? formValues.studentName : '',
            class: '',
            rating: 5,
            content: '',
            agreeToTerms: false
          });
          this.formRating = 5;
          this.loadFeedbacks();
        },
        error: (err) => {
          console.error('Lỗi khi gửi đánh giá:', err);
          this.notification.show('Lỗi', 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.', 'error');
        }
      });
    }
  }

  hasLiked(reviewId: string): boolean {
    return localStorage.getItem('helpful_' + reviewId) === 'true';
  }

  onToggleHelpful(reviewId: string): void {
    if (!reviewId || this.hasLiked(reviewId)) {
      return;
    }
    const review = this.allFeedbacks.find(r => r._id === reviewId);
    if (review) {
      const newHelpfulCount = (review.helpful || 0) + 1;
      this.feedbackService.updateFeedback(reviewId, { helpful: newHelpfulCount }).subscribe({
        next: (updated) => {
          review.helpful = updated.helpful !== undefined ? updated.helpful : newHelpfulCount;
          localStorage.setItem('helpful_' + reviewId, 'true');
          this.applyClientFilters();
        },
        error: (err) => {
          console.error('Không thể cập nhật lượt hữu ích:', err);
        }
      });
    }
  }

  onLoadMoreReviews(): void {
    this.visibleLimit = this.filteredFeedbacks.length;
    this.applyClientFilters();
  }

  onFilterChange(): void {
    this.visibleLimit = 3;
    this.applyClientFilters();
  }

  scrollToWriteReview(): void {
    if (!this.isLoggedIn) {
      this.showLoginPromptModal = true;
      return;
    }
    const el = document.getElementById('write-review-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/reviews' } });
  }

  closeLoginPromptModal(): void {
    this.showLoginPromptModal = false;
  }

  confirmLoginPrompt(): void {
    this.showLoginPromptModal = false;
    this.goToLogin();
  }
}