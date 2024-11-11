import { Component } from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [NgIf, NgClass, ThemeTogglerComponent, RouterLink, NgForOf],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css',
  animations: [
    trigger('bounce', [
      transition('false => true', [
        animate(
          '275ms',
          keyframes([
            style({ transform: 'translateY(-9px)', offset: 0.3 }),
            style({ transform: 'translateY(0px)', offset: 0.6 }),
            style({ transform: 'translateY(3px)', offset: 0.8 }),
            style({ transform: 'translateY(0px)', offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class NavBarComponent {
  currentRoute: string = '/';
  isMobileMenuCollapse: boolean = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.currentRoute = router.url;
    });
  }

  onMobileMenuClick() {
    this.isMobileMenuCollapse = !this.isMobileMenuCollapse;
  }

  letters: string = 'Quentin Yahia';
  bouncingLetters: boolean[] = Array(this.letters.length).fill(false);

  bouncingLettersAnimation() {
    for (let i = 0; i < this.bouncingLetters.length; i++) {
      setTimeout(() => {
        this.setAnimationTrigger(i, true);
      }, 45 * i);
    }
  }

  setAnimationTrigger(index: number, value: boolean) {
    this.bouncingLetters[index] = value;
  }
}
