import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { isDarkThemePreferred } from '../../tools/theme-utils';

@Component({
  selector: 'app-theme-toggler',
  standalone: true,
  imports: [NgIf],
  templateUrl: './theme-toggler.component.html',
  styleUrl: './theme-toggler.component.css',
})
export class ThemeTogglerComponent implements OnInit, OnDestroy {
  isDarkMode: boolean = true;

  private mediaQueryListener:
    | ((event: MediaQueryListEvent) => void)
    | undefined;

  ngOnInit(): void {
    this.setTheme();
    this.mediaQueryListener = this.onThemeChange.bind(this);
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy() {
    if (this.mediaQueryListener)
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', this.mediaQueryListener);
  }

  onToggleThemeClick() {
    localStorage.setItem('theme', isDarkThemePreferred() ? 'light' : 'dark');
    this.setTheme();
  }

  onThemeChange() {
    this.setTheme();
  }

  setTheme() {
    this.isDarkMode = isDarkThemePreferred();
    document.body.classList.toggle('dark', this.isDarkMode);
  }
}
