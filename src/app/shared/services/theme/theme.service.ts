import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  constructor() {
    this.listenForThemeChanges();
  }

  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  private readonly isDarkMode$ = new BehaviorSubject<boolean>(
    this.isDarkThemePreferred(),
  );

  isDarkMode = this.isDarkMode$.asObservable();

  updateTheme(isDarkMode: boolean | undefined = undefined) {
    this.isDarkMode$.next(isDarkMode ?? this.isDarkThemePreferred());
    document.body.classList.toggle('dark', this.isDarkMode$.getValue());
  }

  isDarkThemePreferred(): boolean {
    return localStorage.getItem('theme')
      ? localStorage.getItem('theme') === 'dark'
      : window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private listenForThemeChanges() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', (e) => {
      this.updateTheme(e.matches);
    });

    this.updateTheme(mediaQuery.matches);
  }
}
