import { Injectable } from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SectionScrollService {
  private scrollSubject$ = new BehaviorSubject<number>(0);
  private sectionCount$: number = 0;
  scroll = this.scrollSubject$.asObservable()
    .pipe(distinctUntilChanged());

  get currentIndex() {
    return this.scrollSubject$.value;
  }

  set sectionsCount(sectionCount: number) {
    this.sectionCount$ = sectionCount;
  }

  goToSection(index: number) {
    if (index < 0)
      index = 0;

    if (index > this.sectionCount$ - 1)
      index = this.sectionCount$ - 1;

    this.scrollSubject$.next(index);
  }

  goToNextSection() {
    this.goToSection(this.currentIndex + 1);
  }

  goToPreviousSection() {
    this.goToSection(this.currentIndex - 1);
  }
}
