import {Component, EventEmitter, Input, Output, TemplateRef} from '@angular/core';
import {isError, isLoading, isSuccess, LoadingStatePipe, State} from "../../pipe/loading-state/loading-state.pipe";
import {AsyncPipe, NgClass, NgForOf, NgIf, NgStyle, NgTemplateOutlet} from "@angular/common";
import {RangePipe} from "../../pipe/range/range.pipe";

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [
    NgStyle,
    NgClass,
    NgForOf,
    AsyncPipe,
    LoadingStatePipe,
    NgIf,
    RangePipe,
    NgTemplateOutlet
  ],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css'
})
export class SliderComponent<T> {
  readonly SIMULATE_ACTIVE_CARD: number = 0;
  readonly SIMULATE_NUMBER_CARD: number = 2;

  @Input()
  cardTemplate!: TemplateRef<any>;

  @Input()
  state: State<T[]> = { state: 'loading' };

  @Input()
  datas: T[] = [];

  @Output()
  loadObservable: EventEmitter<void> = new EventEmitter<void>()

  @Input()
  activeIndex: number = 0;
  @Output()
  activeIndexChange: EventEmitter<number> = new EventEmitter<number>();

  handleNext() {
    this.activeIndex = (this.activeIndex + 1) % this.datas.length;
    this.activeIndexChange.emit(this.activeIndex);
  }

  handlePrev() {
    this.activeIndex = (this.activeIndex - 1 + this.datas.length) % this.datas.length;
    this.activeIndexChange.emit(this.activeIndex);
  }

  reload(event: any) {
    event.preventDefault();
    this.loadObservable.emit();
  }

  protected readonly isSuccessState = isSuccess;
  protected readonly isLoadingState = isLoading;
  protected readonly isErrorState = isError;
}
