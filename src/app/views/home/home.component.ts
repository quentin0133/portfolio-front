import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { RangePipe } from '../../pipe/range/range.pipe';
import { ProjectsComponent } from '../../components/projects/projects.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    NgClass,
    NgForOf,
    RangePipe,
    NgIf,
    ProjectsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  private scrollTimeout: any = null;
  private touchStartY: number = 0;

  @ViewChildren('section')
  sections!: QueryList<ElementRef<HTMLElement>>;
  currentSectionIndex: number = 1;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.sections.get(this.currentSectionIndex)?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.ctrlKey || !this.sections?.length || this.scrollTimeout || this.isScrollableElement(event.target as HTMLElement)) {
      return;
    }

    event.preventDefault();

    if (event.deltaY > 0 && this.currentSectionIndex < this.sections.length - 1) {
      this.goToNextSection();
    } else if (event.deltaY < 0 && this.currentSectionIndex > 0) {
      this.goToPreviousSection();
    }

    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
    }, 200);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    // On enregistre la position de départ du touch
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.sections?.length || this.scrollTimeout || this.isScrollableElement(event.target as HTMLElement)) {
      return;
    }

    const touchMoveY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchMoveY;

    // Empêche le comportement par défaut de scroll
    event.preventDefault();

    const sensitivity = 15;

    if (Math.abs(deltaY) > sensitivity) {
      this.scrollTimeout = setTimeout(() => {
        this.scrollTimeout = null;
      }, 200);
    }

    if (deltaY > sensitivity && this.currentSectionIndex < this.sections.length - 1) {
      // Scroll vers le bas, aller à la section suivante
      this.goToNextSection();
    } else if (deltaY < -sensitivity && this.currentSectionIndex > 0) {
      // Scroll vers le haut, aller à la section précédente
      this.goToPreviousSection();
    }

    // Mettez à jour la position de départ du touch pour la prochaine interaction
    this.touchStartY = touchMoveY;
  }

  private isScrollableElement(element: HTMLElement): boolean {
    let currentElement: HTMLElement | null = element;
    const currentSection = this.sections.get(this.currentSectionIndex);

    if (!currentSection) return true;

    while (currentSection.nativeElement.contains(currentElement) && currentElement) {
      if (currentElement.scrollHeight > currentElement.clientHeight) {
        const style = window.getComputedStyle(currentElement);
        const overflowY = style.getPropertyValue('overflow-y');
        if (overflowY === 'auto' || overflowY === 'scroll')
          return true;
      }
      currentElement = currentElement.parentElement;
    }

    return false;
  }

  goToNextSection() {
    this.goToSection(
      Math.min(this.currentSectionIndex + 1, this.sections.length - 1),
    );
  }

  goToPreviousSection() {
    this.goToSection(Math.max(this.currentSectionIndex - 1, 0));
  }

  goToSection(index: number) {
    if (this.currentSectionIndex === index) return;

    this.currentSectionIndex = index;
    this.sections.get(index)?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  onPressEnterNav(event: KeyboardEvent, i: number) {
    if (event.key === 'enter') {
      this.goToSection(i);
    }
  }
}
