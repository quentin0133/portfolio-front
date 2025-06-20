import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AsyncPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {
  isError,
  isLoading,
  isSuccess,
  LoadingStatePipe,
} from '../../../shared/pipe/loading-state/loading-state.pipe';
import { from, mergeMap, Observable, tap } from 'rxjs';
import { Project } from '../../../core/models/project';
import { SliderComponent } from '../../../shared/components/slider/slider.component';
import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ModalVideoComponent } from '../../../shared/components/modal-video/modal-video.component';
import { ProjectStatusLabels } from '../../../shared/enums/project-status-label';
import { TypedTemplateDirective } from '../../../shared/directives/typed-template.directive';
import { ProjectService } from '../../../core/services/project/project.service';
import { ThemeService } from '../../../shared/services/theme/theme.service';
import { FileService } from '../../../shared/services/file/file.service';
import { BgProjectsComponent } from './bg-projects/bg-projects.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    LoadingStatePipe,
    AsyncPipe,
    SliderComponent,
    ModalVideoComponent,
    TypedTemplateDirective,
    BgProjectsComponent,
    DropdownComponent,
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
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  private visibleObserver: IntersectionObserver | undefined;

  projectType!: Project;

  textAnimationState: string = 'out';

  projectCurrentIndex: number = 0;
  projectCurrentIndexTemp: number = 0;

  tabIndex: number = 0;
  tabIndexTemp: number = 0;

  showVideoModal: boolean = false;

  projectsObservable!: Observable<Project[]>;
  projects: Project[] = [];

  coverImageUrlCache: Map<string, string> = new Map<string, string>();

  isDarkTheme!: boolean;

  get currentProject(): Project {
    return this.projects[this.projectCurrentIndexTemp];
  }

  constructor(
    private projectService: ProjectService,
    private cdRef: ChangeDetectorRef,
    private themeService: ThemeService,
    private fileService: FileService,
    private readonly elementRef: ElementRef,
  ) {}

  ngOnInit() {
    this.isDarkTheme = this.themeService.isDarkThemePreferred();
    this.themeService.isDarkMode.subscribe(
      (isDark) => (this.isDarkTheme = isDark),
    );
    this.retrieveProjects();
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
      { threshold: 0.1 },
    );

    this.visibleObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    for (let objectUrl of this.coverImageUrlCache.values()) {
      URL.revokeObjectURL(objectUrl);
    }
    this.coverImageUrlCache.clear();
  }

  retrieveProjects() {
    this.projectsObservable = this.projectService.findAll();
    this.projectService
      .findAll()
      .pipe(
        tap((projects) => (this.projects = projects)),
        mergeMap((projects) => from(projects)),
        mergeMap((project) => this.getFile(project.coverImage.storedFileName)),
        tap((file) => this.addObjectUrl(file)),
      )
      .subscribe();
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

  openVideoModal() {
    this.showVideoModal = true;
  }

  getFile(url: string): Observable<File> {
    return this.fileService.findByUrl(url);
  }

  addObjectUrl(file: File): void {
    if (this.coverImageUrlCache.has(file.name)) return;
    this.coverImageUrlCache.set(file.name, URL.createObjectURL(file));
  }

  protected readonly isSuccess = isSuccess;
  protected readonly isLoading = isLoading;
  protected readonly isError = isError;
  protected readonly ProjectStatusLabels = ProjectStatusLabels;
}
