import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
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
}
