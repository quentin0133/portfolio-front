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
import { RangePipe } from '../../pipe/range.pipe';
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

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.ctrlKey || !this.sections?.length) {
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
