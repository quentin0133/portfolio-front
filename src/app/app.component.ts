import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener, OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { ThemeService } from './shared/services/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('navView') nav: ElementRef | undefined;
  @ViewChild('mainView') main: ElementRef | undefined;

  constructor(
    private readonly themeService: ThemeService,
    private readonly renderer: Renderer2,
  ) {}

  ngOnInit() {
    this.themeService.updateTheme();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => this.updateMainHeight());
  }

  @HostListener('window:resize')
  onResize() {
    this.updateMainHeight();
  }

  private updateMainHeight() {
    const navHeight = this.nav?.nativeElement.clientHeight || 0;
    if (navHeight > 0) {
      this.renderer.setStyle(
        this.main?.nativeElement,
        'height',
        `calc(100vh - ${navHeight}px)`,
      );

      this.renderer.setStyle(
        this.main?.nativeElement,
        'margin-top',
        `${navHeight}px`,
      );
    }
  }
}
