import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { HeroComponent } from './hero/hero.component';
import { Subscription } from 'rxjs';
import { SectionScrollService } from '../../shared/services/section-scroll/section-scroll.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private scrollTimeout: any = null;
  private touchStartY: number = 0;

  @ViewChild('hero', { read: ViewContainerRef, static: true })
  heroContainer!: ViewContainerRef;

  @ViewChild('projects', { read: ViewContainerRef, static: true })
  projectsContainer!: ViewContainerRef;

  @ViewChild('aboutMe', { read: ViewContainerRef, static: true })
  aboutMeContainer!: ViewContainerRef;

  @ViewChild('contact', { read: ViewContainerRef, static: true })
  contactContainer!: ViewContainerRef;

  @ViewChildren('section')
  sections!: QueryList<ElementRef<HTMLElement>>;

  private scrollSub!: Subscription;

  reflowTimeout: any = null;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private scrollService: SectionScrollService,
  ) {}

  get currentSectionIndex() {
    return this.scrollService.currentIndex;
  }

  ngAfterViewInit() {
    this.scrollSub = this.scrollService.scroll.subscribe((index) =>
      this.goToSection(index),
    );

    this.scrollService.sectionsCount = this.sections.length;

    this.initObservationSectionLoading();
    this.cdr.detectChanges();
    this.resize();
  }

  ngOnDestroy() {
    // Clean subscriptions
    if (this.scrollSub) {
      this.scrollSub.unsubscribe();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (
      event.ctrlKey &&
      (event.code === 'NumpadAdd' || event.code === 'NumpadSubtract')
    ) {
      this.resize();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.resize();
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (
      event.ctrlKey ||
      !this.sections?.length ||
      this.scrollTimeout ||
      this.isScrollableElement(event.target as HTMLElement)
    ) {
      return;
    }

    event.preventDefault();

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
      // Scroll down, go to next section
      this.goToNextSection();
    } else if (deltaY < -sensitivity && this.currentSectionIndex > 0) {
      // Scroll up, go to previous section
      this.goToPreviousSection();
    }

    // Update touch start position for next interaction
    this.touchStartY = touchMoveY;
  }

  resize() {
    if (this.reflowTimeout) clearTimeout(this.reflowTimeout);

    this.calculateSectionHeight();

    this.reflowTimeout = setTimeout(() => {
      this.sections
        .get(this.currentSectionIndex)
        ?.nativeElement.scrollIntoView({
          behavior: 'smooth',
        });
    }, 50);
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
    this.scrollService.goToNextSection();
  }

  goToPreviousSection() {
    this.scrollService.goToPreviousSection();
  }

  goToSection(index: number) {
    this.sections.get(index)?.nativeElement.scrollIntoView({
      behavior: 'smooth',
    });
  }

  async loadSection(id: string) {
    switch (id) {
      case 'hero':
        let { HeroComponent } = await import('./hero/hero.component');
        this.heroContainer.clear();
        this.heroContainer.createComponent(HeroComponent);
        break;
      case 'projects':
        let { ProjectsComponent } = await import(
          './projects/projects.component'
        );
        this.projectsContainer.clear();
        this.projectsContainer.createComponent(ProjectsComponent);
        break;
      case 'about-me':
        let { AboutMeComponent } = await import(
          './about-me/about-me.component'
        );
        this.aboutMeContainer.clear();
        this.aboutMeContainer.createComponent(AboutMeComponent);
        break;
      case 'contact':
        let { ContactComponent } = await import('./contact/contact.component');
        this.contactContainer.clear();
        this.contactContainer.createComponent(ContactComponent);
        break;
      default:
        throw new Error("I'm a teapot");
    }
  }

  private calculateSectionHeight() {
    this.sections.forEach((section: ElementRef<HTMLElement>) => {
      const navBar = document.getElementById('navbar');
      if (!navBar) return;
      const navHeight = navBar.offsetHeight;
      const viewportHeight = window.innerHeight;

      section.nativeElement.style.height = `${viewportHeight - navHeight}px`;
    });
  }

  private lazyLoadingSection(
    elementObserved: ElementRef<HTMLElement>,
    loadingSection: () => void,
  ) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadingSection();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(elementObserved.nativeElement);
  }

  private initObservationSectionLoading() {
    for (let section of this.sections) {
      this.lazyLoadingSection(section, () =>
        this.loadSection(section.nativeElement.id),
      );
    }
  }
}
