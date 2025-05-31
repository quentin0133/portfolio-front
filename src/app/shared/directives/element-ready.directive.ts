import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Output,
} from '@angular/core';

@Directive({
  selector: '[elementReady]',
  standalone: true,
})
export class ElementReadyDirective implements AfterViewInit {
  @Output() elementReady = new EventEmitter<ElementRef>();

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.elementReady.emit(this.el);
    })
  }
}
