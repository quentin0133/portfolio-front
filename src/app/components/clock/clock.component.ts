import { Component, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-clock',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './clock.component.html',
  styleUrl: './clock.component.css',
  animations: [
    trigger('flotterAnimation', [
      transition('* => up', [
        animate(
          '5s ease-in-out',
          keyframes([
            style({ transform: 'translateY(10px)', offset: 0 }),
            style({ transform: 'translateY(-10px)', offset: 1 }),
          ]),
        ),
      ]),
      transition('* => down', [
        animate(
          '5s ease-in-out',
          keyframes([
            style({ transform: 'translateY(-10px)', offset: 0 }),
            style({ transform: 'translateY(10px)', offset: 1 }),
          ]),
        ),
      ]),
    ]),
  ],
})
export class ClockComponent implements OnInit {
  floatState: string = 'up';
  hourAngle: number = 0;
  minuteAngle: number = 0;
  secondAngle: number = 0;

  ngOnInit() {
    this.updateClock();

    setInterval(() => {
      this.updateClock();
    }, 1000);

    setInterval(() => {
      this.toggleFloatAnimation();
    }, 5000);
  }

  toggleFloatAnimation(): void {
    this.floatState = this.floatState === 'up' ? 'down' : 'up';
  }

  updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // 30 degree per hour + 0.5 degree per minute
    this.hourAngle = (hours % 12) * 30 + minutes * 0.5;
    // 6 degree per minute
    this.minuteAngle = minutes * 6;
    // 6 degree per second
    this.secondAngle = seconds * 6;
  }
}
