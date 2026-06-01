import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../services/course';
import { iCourse } from '../../interfaces/course';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('homeVideo') homeVideo!: ElementRef<HTMLVideoElement>;

  currentSlide = 0;

  banners: string[] = ['/banner1.png', '/banner2.png', '/banner3.png', '/banner4.png'];
  currentBannerIndex = 0;
  bannerInterval: any;
  courses: iCourse[] = [];

  constructor(private courseService: Course, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.fetchCourses();
    this.bannerInterval = setInterval(() => {
      this.currentBannerIndex = (this.currentBannerIndex + 1) % this.banners.length;
    }, 2000);
  }

  ngOnDestroy() {
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
  }

  ngAfterViewInit() {
    if (this.homeVideo && this.homeVideo.nativeElement) {
      this.homeVideo.nativeElement.muted = true;
      this.homeVideo.nativeElement.play().catch(error => console.log('Autoplay prevented:', error));
    }
  }

  fetchCourses() {
    this.courseService.getCourses().subscribe({
      next: (data) => {
        // filter active courses if necessary, or just use all
        this.courses = data.filter(course => course.active !== false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching courses', err);
      }
    });
  }

  nextSlide(): void {
    const maxSlide = 1;

    if (this.currentSlide < maxSlide) {
      this.currentSlide++;
    }
  }

  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

}