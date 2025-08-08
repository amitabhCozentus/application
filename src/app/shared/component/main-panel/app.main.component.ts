import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { TopbarComponent } from '../topbar/topbar.component';
import { RouterOutlet } from '@angular/router';
import { AppFooterComponent } from '../footer/app.footer.component';

@Component({
  selector: 'app-main-component',
  imports: [TopbarComponent, AppFooterComponent, RouterOutlet],
  templateUrl: './app.main.component.html',
  styleUrl: './app.main.component.scss'
})
export class AppMainComponent implements AfterViewInit, OnDestroy {
  @ViewChild('topbar', { static: true }) topbarRef!: ElementRef;

  topbarHeight: number = 128; // Default fallback height (8rem = 128px)
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    this.calculateTopbarHeight();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    // Debounce the resize calculation
    setTimeout(() => this.calculateTopbarHeight(), 100);
  }

  private calculateTopbarHeight() {
    if (this.topbarRef?.nativeElement) {
      const height = this.topbarRef.nativeElement.offsetHeight;
      // Add some padding (16px) to prevent content from touching the topbar
      this.topbarHeight = height + 16;
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.topbarRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculateTopbarHeight();
      });
      this.resizeObserver.observe(this.topbarRef.nativeElement);
    }
  }
}
