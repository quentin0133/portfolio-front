import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { HeroComponent } from '../../components/sections/hero/hero.component';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { RangePipe } from '../../pipe/range/range.pipe';
import { ProjectsComponent } from '../../components/sections/projects/projects.component';
import {ContactComponent} from "../../components/sections/contact/contact.component";
import {AboutMeComponent} from "../../components/about-me/about-me.component";

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
    ContactComponent,
    AboutMeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  private scrollTimeout: any = null;
  private touchStartY: number = 0;

  @ViewChildren('section')
  sections!: QueryList<ElementRef<HTMLElement>>;
  currentSectionIndex: number = 0;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.sections.get(this.currentSectionIndex)?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });

    const navBar = document.getElementById('navbar');
    if (!navBar) return;
    const navHeight = navBar.offsetHeight;
    const viewportHeight = window.innerHeight;

    //console.log(viewportHeight - navHeight)

    this.sections.forEach((section: ElementRef<HTMLElement>) => {
      section.nativeElement.style.height = `${viewportHeight - navHeight}px`;
    });
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    const currentZoom = window.devicePixelRatio;
    //console.log(currentZoom)
    if (
      (event.ctrlKey && event.deltaY < 0) ||
      currentZoom > 1 ||
      !this.sections?.length ||
      this.scrollTimeout ||
      this.isScrollableElement(event.target as HTMLElement)
    ) {
      return;
    }

    event.preventDefault();

    if (event.ctrlKey) {
      return;
    }

    if (
      event.deltaY > 0 &&
      this.currentSectionIndex < this.sections.length - 1
    ) {
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
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (
      !this.sections?.length ||
      this.scrollTimeout ||
      this.isScrollableElement(event.target as HTMLElement)
    ) {
      return;
    }

    const touchMoveY = event.touches[0].clientY;
    const deltaY = this.touchStartY - touchMoveY;

    event.preventDefault();

    const sensitivity = 15;

    if (Math.abs(deltaY) > sensitivity) {
      this.scrollTimeout = setTimeout(() => {
        this.scrollTimeout = null;
      }, 200);
    }

    if (
      deltaY > sensitivity &&
      this.currentSectionIndex < this.sections.length - 1
    ) {
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

    while (
      currentSection.nativeElement.contains(currentElement) &&
      currentElement
    ) {
      if (currentElement.scrollHeight > currentElement.clientHeight) {
        const style = window.getComputedStyle(currentElement);
        const overflowY = style.getPropertyValue('overflow-y');
        if (overflowY === 'auto' || overflowY === 'scroll') return true;
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
