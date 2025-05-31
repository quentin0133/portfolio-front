import {
  AfterViewInit,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input, NgZone, OnChanges,
  Output,
  QueryList, SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  isError,
  isLoading,
  isSuccess,
  State,
} from '../../pipe/loading-state/loading-state.pipe';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { RangePipe } from '../../pipe/range/range.pipe';
import { ElementReadyDirective } from '../../directives/element-ready.directive';
import {take} from "rxjs";

@Component({
  selector: 'app-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    NgForOf,
    NgIf,
    RangePipe,
    NgTemplateOutlet,
    ElementReadyDirective,
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
})
export class SliderComponent<T> implements OnChanges {
  readonly SIMULATE_ACTIVE_CARD: number = 0;
  readonly SIMULATE_NUMBER_CARD: number = 2;

  @ContentChild(TemplateRef)
  childTemplate!: TemplateRef<{ $implicit: T }>;

  @ContentChild('noContent')
  noContentTemplate!: TemplateRef<any>;

  @Input()
  state: State<T[]> = { state: 'loading' };

  @Output()
  loadObservable: EventEmitter<void> = new EventEmitter<void>();

  @Input()
  activeIndex: number = 0;
  @Output()
  activeIndexChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChildren('sliderItem')
  sliderItems: QueryList<ElementRef> = new QueryList<ElementRef>();

  currentSlidePositionX: number = 0;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state'] && !isLoading(changes['state'].currentValue)) {
      setTimeout(() => this.updateCurrentSliderPositionX());
    }
  }

  handleNext() {
    if (!isSuccess(this.state)) return;
    this.activeIndex = (this.activeIndex + 1) % this.state.data.length;
    this.activeIndexChange.emit(this.activeIndex);
    this.updateCurrentSliderPositionX();
  }

  handlePrev() {
    if (!isSuccess(this.state)) return;
    const dataLength = this.state.data.length;
    this.activeIndex = (this.activeIndex - 1 + dataLength) % dataLength;
    this.activeIndexChange.emit(this.activeIndex);
    this.updateCurrentSliderPositionX();
  }

  reload(event: any) {
    event.preventDefault();
    this.loadObservable.emit();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateCurrentSliderPositionX();
  }

  updateCurrentSliderPositionX(): void {
    let currentSlide;

    if (this.sliderItems.length === 0) return;

    currentSlide = this.sliderItems.get(this.activeIndex);

    if (!currentSlide) return;

    const rect = currentSlide.nativeElement.getBoundingClientRect();
    const parentRect =
      currentSlide.nativeElement.parentElement.getBoundingClientRect();

    const rectCenterX = rect.left + rect.width / 2;
    const parentCenterX = parentRect.left + parentRect.width / 2;

    this.currentSlidePositionX = parentCenterX - rectCenterX

    this.cdRef.detectChanges();
  }

  async loadAllImagesAsync(images: HTMLImageElement[]): Promise<void> {
    console.log(images)
    const promises = images.map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete && img.naturalHeight !== 0) {
          resolve();
        } else {
          const cleanup = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
          };

          const onLoad = () => {
            cleanup();
            resolve();
          };

          const onError = () => {
            cleanup();
            resolve();
          };

          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        }
      });
    });

    return Promise.all(promises).then(() => void 0);
  }



  protected readonly isSuccessState = isSuccess;
  protected readonly isLoadingState = isLoading;
  protected readonly isErrorState = isError;
}
