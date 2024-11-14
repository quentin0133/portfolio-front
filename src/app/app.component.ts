import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { NgClass } from '@angular/common';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('navView') nav: ElementRef | undefined;
  @ViewChild('mainView') main: ElementRef | undefined;

  private mediaQueryListener:
    | ((event: MediaQueryListEvent) => void)
    | undefined;

  constructor(
    private readonly themeService: ThemeService,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.themeService.updateTheme();
    this.mediaQueryListener = () => this.themeService.updateTheme();
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', this.mediaQueryListener);
  }

  ngAfterViewInit(): void {
    const navHeight = this.nav?.nativeElement.clientHeight || 0;
    this.renderer.setStyle(
      this.main?.nativeElement,
      'height',
      `calc(100vh - ${navHeight}px)`,
    );
  }

  ngOnDestroy() {
    if (this.mediaQueryListener)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', this.mediaQueryListener);
  }

  onThemeChange() {
    this.themeService.updateTheme();
  }
}
