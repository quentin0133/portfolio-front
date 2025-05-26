import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList, TemplateRef,
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
import {TypedTemplateDirective} from "../../directives/typed-template.directive";

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
export class SliderComponent<T> {
  readonly SIMULATE_ACTIVE_CARD: number = 0;
  readonly SIMULATE_NUMBER_CARD: number = 2;

  @ContentChild(TemplateRef)
  childTemplate!: TemplateRef<{ $implicit: T }>;

  @Input()
  state: State<T[]> = { state: 'loading' };

  @Output()
  loadObservable: EventEmitter<void> = new EventEmitter<void>();

  @Input()
  activeIndex: number = 0;
  @Output()
  activeIndexChange: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('sliderContainer', { static: false })
  sliderContainer!: ElementRef;

  @ViewChildren('sliderItem')
  sliderItems: QueryList<ElementRef> = new QueryList<ElementRef>();

  currentSlidePositionX: number = 0;

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
    if (!this.sliderContainer || this.sliderItems.length === 0) return;

    const currentSlide = this.sliderItems.get(this.activeIndex);

    if (!currentSlide) return;

    const rect = currentSlide.nativeElement.getBoundingClientRect();
    const parentRect =
      currentSlide.nativeElement.parentElement.getBoundingClientRect();

    const rectCenterX = rect.left + rect.width / 2;
    const parentCenterX = parentRect.left + parentRect.width / 2;

    this.currentSlidePositionX = parentCenterX - rectCenterX;
  }

  protected readonly isSuccessState = isSuccess;
  protected readonly isLoadingState = isLoading;
  protected readonly isErrorState = isError;
}
