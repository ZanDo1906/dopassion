import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home-page',
  imports: [],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('homeVideo') homeVideo!: ElementRef<HTMLVideoElement>;

  currentSlide = 0;

  banners: string[] = ['/banner1.png', '/banner2.png', '/banner3.png', '/banner4.png'];
  currentBannerIndex = 0;
  bannerInterval: any;

  ngOnInit() {
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