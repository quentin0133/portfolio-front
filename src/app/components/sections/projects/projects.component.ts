import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
} from '@angular/core';
import {
  AsyncPipe,
  NgClass,
  NgForOf,
  NgIf,
  NgOptimizedImage,
  NgStyle,
  NgSwitch,
  NgSwitchCase,
} from '@angular/common';
import {
  isLoading,
  isSuccess,
  LoadingStatePipe,
} from '../../../pipe/loading-state/loading-state.pipe';
import { Observable } from 'rxjs';
import { Project } from '../../../models/project';
import { ProjectService } from '../../../services/project/project.service';
import { SliderComponent } from '../../slider/slider.component';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ThemeService } from '../../../services/theme/theme.service';
import { ModalVideoComponent } from '../../modal-video/modal-video.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    LoadingStatePipe,
    AsyncPipe,
    NgSwitchCase,
    NgSwitch,
    NgStyle,
    SliderComponent,
    NgOptimizedImage,
    ModalVideoComponent,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css',
  animations: [
    trigger('fadeInOut', [
      state(
        'in',
        style({ backgroundPosition: '0% 0%', backgroundSize: '300% 300%' }),
      ),
      state(
        'out',
        style({ backgroundPosition: '100% 0%', backgroundSize: '300% 300%' }),
      ),
      transition('out => in', [
        animate(
          '0.5s ease-in-out',
          keyframes([
            style({
              backgroundPosition: '100% 0%',
              backgroundSize: '300% 300%',
            }),
            style({
              backgroundPosition: '0% 0%',
              backgroundSize: '300% 300%',
            }),
          ]),
        ),
      ]),
      transition('in => out', [
        animate(
          '0.5s ease-in-out',
          keyframes([
            style({
              backgroundPosition: '0% 0%',
              backgroundSize: '300% 300%',
            }),
            style({
              backgroundPosition: '100% 0%',
              backgroundSize: '300% 300%',
            }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class ProjectsComponent implements AfterViewInit {
  private visibleObserver: IntersectionObserver | undefined;

  textAnimationState = 'out';

  projectCurrentIndex: number = 0;
  projectCurrentIndexTemp: number = 0;
  tabIndex: number = 0;
  tabIndexTemp: number = 0;

  showVideoModal: boolean = false;

  projectsObservable: Observable<Project[]>;
  currentSelectedProject: Project | undefined;

  constructor(
    private projectService: ProjectService,
    private readonly elementRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private themeService: ThemeService,
  ) {
    this.projectsObservable = this.projectService.findAll();
  }

  ngAfterViewInit(): void {
    this.visibleObserver = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;

        if (isVisible) {
          this.setTextAnimation('in');
        } else {
          this.setTextAnimation('out');
        }
      },
      { threshold: 0.8 },
    );

    this.visibleObserver.observe(this.elementRef.nativeElement);
  }

  reload() {
    this.projectsObservable = this.projectService.findAll();
  }

  selectTab(newIndexTab: number) {
    this.setTextAnimation('out');
    this.tabIndexTemp = newIndexTab;
  }

  setActiveIndex(activeIndex: number) {
    this.setTextAnimation('out');
    this.projectCurrentIndexTemp = activeIndex;
  }

  setTextAnimation(newState: string) {
    this.textAnimationState = newState;
  }

  onAnimationDone(event: any) {
    this.projectCurrentIndex = this.projectCurrentIndexTemp;
    this.tabIndex = this.tabIndexTemp;
    if (event.toState === 'out') {
      setTimeout(() => {
        this.setTextAnimation('in');
      }, 10);
    }
    this.cdRef.detectChanges();
  }

  openVideoModal(project: Project) {
    this.currentSelectedProject = project;
    this.showVideoModal = true;
  }

  isDarkMode(): Observable<boolean> {
    return this.themeService.isDarkMode;
  }

  protected readonly isSuccess = isSuccess;
  protected readonly isLoading = isLoading;
}
