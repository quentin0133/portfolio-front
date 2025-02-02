import {Component, OnDestroy, OnInit} from '@angular/core';
import {ThemeService} from "../../services/theme/theme.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent implements OnInit, OnDestroy {
  private themeChangeSubscription: Subscription | undefined;

  isDarkMode: boolean = false;

  constructor(private readonly themeService: ThemeService) {
  }

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
}
