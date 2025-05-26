import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BgDarkHeroService } from './bg-dark-hero.service';
import { ThemeService } from '../../../../shared/services/theme/theme.service';
import { Subscription } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-bg-mode-hero',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './bg-hero.component.html',
  styleUrl: './bg-hero.component.css',
})
export class BgHeroComponent implements OnInit, AfterViewInit, OnDestroy {
  private intersectionObserverDark!: IntersectionObserver;

  isDarkTheme!: boolean;
  isVisible!: boolean;

  themeSubscription!: Subscription;

  @ViewChild('darkThemeCanvas')
  darkThemeCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private readonly bgDarkModeHeroService: BgDarkHeroService,
    private readonly themeService: ThemeService,
    private elementRef: ElementRef,
  ) {}

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkThemePreferred();
    this.themeSubscription = this.themeService.isDarkMode.subscribe(
      (isDarkTheme) => {
        this.isDarkTheme = isDarkTheme;
        this.updateBackground();
      },
    );
  }

  ngAfterViewInit(): void {
    this.intersectionObserverDark = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
        this.updateBackground();
      },
      { root: null, threshold: 0.1 }, // 10% visible = trigger
    );

    this.intersectionObserverDark.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.intersectionObserverDark?.disconnect();
    this.bgDarkModeHeroService.cleanUp();
    this.themeSubscription.unsubscribe();
  }

  private updateBackground() {
    setTimeout(() => {
      if (this.isVisible && this.isDarkTheme) {
        this.bgDarkModeHeroService.initThreeJS(this.darkThemeCanvas);
        this.bgDarkModeHeroService.animate();
      } else {
        this.bgDarkModeHeroService.cleanUp();
      }
    });
  }
}
