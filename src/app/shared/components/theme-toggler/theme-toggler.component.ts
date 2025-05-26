import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ThemeService } from '../../services/theme/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-theme-toggler',
  standalone: true,
  imports: [NgIf],
  templateUrl: './theme-toggler.component.html',
  styleUrl: './theme-toggler.component.css',
})
export class ThemeTogglerComponent implements OnInit, OnDestroy {
  private themeChangeSubscription: Subscription | undefined;

  isDarkMode: boolean = false;

  constructor(private readonly themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkThemePreferred();
    this.themeChangeSubscription = this.themeService.isDarkMode.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      },
    );
  }

  ngOnDestroy() {
    if (this.themeChangeSubscription) {
      this.themeChangeSubscription.unsubscribe();
    }
  }

  onToggleThemeClick() {
    localStorage.setItem('theme', this.isDarkMode ? 'light' : 'dark');
    this.themeService.updateTheme();
  }
}
