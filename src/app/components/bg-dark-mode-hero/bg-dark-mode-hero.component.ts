import { AfterViewInit, Component, ElementRef, OnDestroy } from '@angular/core';
import { BgDarkModeHeroService } from './bg-dark-mode-hero.service';

@Component({
  selector: 'app-bg-dark-mode-hero',
  standalone: true,
  imports: [],
  templateUrl: './bg-dark-mode-hero.component.html',
  styleUrl: './bg-dark-mode-hero.component.css',
})
export class BgDarkModeHeroComponent implements AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | undefined;

  constructor(
    private readonly bgDarkModeHeroService: BgDarkModeHeroService,
    private readonly elementRef: ElementRef,
  ) {}

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;

        if (isVisible) {
          console.log('Composant visible');
          this.bgDarkModeHeroService.initThreeJS(this.elementRef);
          this.bgDarkModeHeroService.animate();
        } else {
          console.log('Composant caché');
          this.bgDarkModeHeroService.cleanUp();
        }
      },
      { threshold: 0.1 }, // 10% visible = déclenchement
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.bgDarkModeHeroService.cleanUp();
  }
}
