import { Component } from '@angular/core';
import { NgClass, NgForOf } from '@angular/common';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';
import { NavigationEnd, Router } from '@angular/router';
import { SectionScrollService } from '../../services/section-scroll/section-scroll.service';
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
  imports: [NgClass, ThemeTogglerComponent, NgForOf],
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

  constructor(
    private router: Router,
    private scrollService: SectionScrollService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.currentRoute = router.url;
    });
  }

  scrollTo(sectionIndex: number) {
    this.scrollService.goToSection(sectionIndex);
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

  navigateTo(path: string, indexScroll: number = 0) {
    this.scrollTo(indexScroll);
    this.router.navigateByUrl(path);
  }
}
