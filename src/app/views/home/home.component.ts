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
  @ViewChildren('section')
  sections!: QueryList<ElementRef<HTMLElement>>;
  currentSectionIndex: number = 1;

  private scrollTimeout: any = null;

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

    const currentSectionIndex = Array.from(this.sections).findIndex(
      (section) => section.nativeElement.getBoundingClientRect().top >= 0,
    );

    if (event.deltaY > 0 && currentSectionIndex < this.sections.length - 1) {
      this.goToNextSection();
    } else if (event.deltaY < 0 && currentSectionIndex > 0) {
      this.goToPreviousSection();
    }

    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
    }, 200);
  }

  private isScrollableElement(element: HTMLElement): boolean {
    let currentElement: HTMLElement | null = element;
    const currentSection = this.sections.get(this.currentSectionIndex);

    if (!currentSection) return true;

    while (currentSection.nativeElement.contains(currentElement) && currentElement) {
      if (currentElement.scrollHeight > currentElement.clientHeight)
        return true;
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
