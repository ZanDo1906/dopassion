import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import 'iconify-icon';

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
export class Reviews {
  // Make Math available in template
  Math = Math;

  // Constants
  readonly averageRating = 4.8;
  readonly totalReviews = 1245;
  readonly fiveStarPercentage = 72;
  readonly responseRatePercentage = 91;
  readonly categories = ['TOEIC', 'IELTS', 'Giao tiếp', 'Speaking'];

  // Rating Data
  ratingDistribution: RatingDistribution[] = [
    { stars: 5, percentage: 72, count: 894 },
    { stars: 4, percentage: 18, count: 223 },
    { stars: 3, percentage: 6, count: 74 },
    { stars: 2, percentage: 3, count: 37 },
    { stars: 1, percentage: 1, count: 12 }
  ];

  detailedRatings: DetailedRating[] = [
    { category: 'Giảng viên', rating: 5 },
    { category: 'Nội dung khóa học', rating: 5 },
    { category: 'Hỗ trợ', rating: 5 }
  ];

  // Reviews Data
  reviews: Review[] = [
    {
      id: 1,
      author: 'Nguyễn Tấn Dũng',
      avatar: 'https://ui-avatars.com/api/?name=ND&background=ef4444&color=fff',
      date: '21/12/2023',
      rating: 5,
      course: 'TOEIC',
      courseCode: 'TOEIC LR108',
      content: 'Mình rất hài lòng với khóa học vì giảng viên truyền đạt dễ hiểu, lớp học đúng tiến độ và đội ngũ hỗ trợ phản hồi nhanh mỗi khi cần. Phần bài tập được thiết kế vừa sức nhưng vẫn đủ thử thách để mình cải thiện kỹ năng đều hơn.',
      helpful: 24,
      hasReply: true,
      reply: 'Cảm ơn bạn đã dành thời gian chia sẻ cảm nhận. Trung tâm rất vui khi chất lượng giảng dạy và hỗ trợ đã mang lại trải nghiệm tích cực cho bạn.',
      replyAuthor: 'Giảng viên ĐỒNG TRƯỜNG'
    },
    {
      id: 2,
      author: 'Trần Gia Hân',
      avatar: 'https://ui-avatars.com/api/?name=TH&background=f97316&color=fff',
      date: '18/12/2023',
      rating: 4,
      course: 'IELTS',
      courseCode: 'IELTS FOUNDATION',
      content: 'Giáo trình khá rõ ràng và bài tập về nhà bám sát nội dung trên lớp. Mình mong trung tâm có thêm nhiều buổi chữa speaking theo nhóm nhỏ để được góp ý kỹ hơn cho từng học viên.',
      helpful: 16,
      hasReply: false
    },
    {
      id: 3,
      author: 'Lê Minh Tuấn',
      avatar: 'https://ui-avatars.com/api/?name=LMT&background=3b82f6&color=fff',
      date: '15/12/2023',
      rating: 5,
      course: 'Giao tiếp',
      courseCode: 'COMMUNICATION 101',
      content: 'Khóa học rất bổ ích, giáo viên thân thiện và giúp đỡ hết mình. Mình đã cải thiện kỹ năng giao tiếp đáng kể sau khóa học này. Sẽ tiếp tục học khóa tiếp theo.',
      helpful: 32,
      hasReply: true,
      reply: 'Cảm ơn Tuấn! Rất vui khi bạn có tiến bộ. Chúng tôi sẽ chờ bạn trong khóa học tiếp theo.',
      replyAuthor: 'DoPassion Team'
    }
  ];

  // Filter States
  selectedClass = '';
  selectedRating = '';
  selectedSort = 'newest';
  searchQuery = '';
  formRating = 0;

  // Reactive Form
  reviewFormGroup: FormGroup;

  constructor(private fb: FormBuilder) {
    this.reviewFormGroup = this.fb.group({
      class: ['', Validators.required],
      rating: [5, Validators.required],
      satisfaction: ['very-satisfied', Validators.required],
      content: ['', [Validators.required, Validators.minLength(20)]],
      agreeToTerms: [false, Validators.requiredTrue]
    });
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
      console.log('Review submitted:', this.reviewFormGroup.value);
      alert('Cảm ơn bạn! Đánh giá của bạn sẽ được kiểm duyệt trong 24h.');
      this.reviewFormGroup.reset();
      this.formRating = 0;
    }
  }

  onToggleHelpful(reviewId: number): void {
    const review = this.reviews.find(r => r.id === reviewId);
    if (review) {
      review.helpful += 1;
      console.log(`Marked review ${reviewId} as helpful. Total: ${review.helpful}`);
    }
  }

  onReply(reviewId: number): void {
    console.log('Reply clicked for review:', reviewId);
    alert('Tính năng này sẽ được kích hoạt sớm.');
  }

  onMoreOptions(reviewId: number): void {
    console.log('More options clicked for review:', reviewId);
  }

  onLoadMoreReviews(): void {
    console.log('Load more reviews clicked');
    alert('Đang tải thêm đánh giá...');
  }

  onFilterChange(): void {
    console.log('Filters applied:', {
      class: this.selectedClass,
      rating: this.selectedRating,
      sort: this.selectedSort
    });
  }
}