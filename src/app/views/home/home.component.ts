import {
  AfterViewInit,
  Component,
  HostListener,
  ViewChild,
} from '@angular/core';
import { HeroComponent } from '../../components/hero/hero.component';
import { TerminalComponent } from '../../components/info-box/terminal/terminal.component';
import { setTimeoutAsync } from '../../tools/js-native-utils';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, TerminalComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('terminal') terminal!: TerminalComponent;
  sections!: NodeListOf<HTMLElement>;
  currentSectionIndex: number = 0;

  ngAfterViewInit(): void {
    this.introduction();
    this.sections = document.querySelectorAll('section');
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    event.preventDefault();

    const currentSectionIndex = Array.from(this.sections).findIndex(
      (section) => section.getBoundingClientRect().top >= 0,
    );

    if (event.deltaY > 0 && currentSectionIndex < this.sections.length - 1) {
      this.goToNextSection();
    } else if (event.deltaY < 0 && currentSectionIndex > 0) {
      this.goToPreviousSection();
    }
  }

  private goToNextSection() {
    this.goToSection(
      Math.min(this.currentSectionIndex + 1, this.sections.length - 1),
    );
  }

  private goToPreviousSection() {
    this.goToSection(Math.max(this.currentSectionIndex - 1, 0));
  }

  private goToSection(index: number) {
    if (this.currentSectionIndex === index) return;

    this.currentSectionIndex = index;
    this.sections[index].scrollIntoView({
      behavior: 'smooth',
    });
  }

  private async introduction() {
    await this.terminal.writeText(
      'Bonjour, <red>bienvenue</red> sur le portfolio de Quentin YAHIA.',
    );
    await setTimeoutAsync(undefined, 5000);
    await this.terminal.writeText(
      'Je serais votre guide au travers de ce portfolio.',
    );
    await setTimeoutAsync(undefined, 5000);
    await this.terminal.writeText(
      'mon but sera de vous présenter les compétences de mon créateur.',
    );
  }
}
