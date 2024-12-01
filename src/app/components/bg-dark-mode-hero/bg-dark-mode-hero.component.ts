import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { BgDarkModeHeroService } from './bg-dark-mode-hero.service';

@Component({
  selector: 'app-bg-dark-mode-hero',
  standalone: true,
  imports: [],
  templateUrl: './bg-dark-mode-hero.component.html',
  styleUrl: './bg-dark-mode-hero.component.css',
})
export class BgDarkModeHeroComponent implements AfterViewInit {
  constructor(
    private readonly bgDarkModeHeroService: BgDarkModeHeroService,
    private readonly elementRef: ElementRef,
  ) {}

  ngAfterViewInit(): void {
    this.bgDarkModeHeroService.initThreeJS(this.elementRef);
  }
}
