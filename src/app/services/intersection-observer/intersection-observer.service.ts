import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IntersectionObserverService {
  private readonly observer!: IntersectionObserver;
  private readonly callbacks = new Map<Element, (isVisible: boolean) => void>();

  constructor() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const callback = this.callbacks.get(entry.target);
        if (callback) {
          callback(entry.isIntersecting);
        }
      });
    });
  }

  observe(element: Element, callback: (isVisible: boolean) => void): void {
    this.callbacks.set(element, callback);
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.callbacks.delete(element);
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
    this.callbacks.clear();
  }
}
