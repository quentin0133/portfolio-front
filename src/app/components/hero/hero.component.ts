import { AfterViewInit, Component } from '@angular/core';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { TerminalComponent } from '../info-box/terminal/terminal.component';
import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { setTimeoutAsync } from '../../tools/js-native-utils';
import { ClockComponent } from '../clock/clock.component';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

const WRITING_SPEED = 65;
const ERASE_SPEED = 65;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    NgForOf,
    NgStyle,
    TerminalComponent,
    NgIf,
    ClockComponent,
    ThemeTogglerComponent,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements AfterViewInit {
  welcomeText: string = '';
  qualityText: string = '';
  private readonly mappingTag = [
    { id: 'blue', tag: 'text-blue-400' },
    { id: 'red', tag: 'text-red-500' },
    { id: 'green', tag: 'text-green-500' },
  ];

  async ngAfterViewInit(): Promise<void> {
    await setTimeoutAsync(undefined, 1500);
    await this.writeText(
      'Bienvenue sur le portfolio de Quentin YAHIA',
      () => this.welcomeText,
      (newText: string) => (this.welcomeText = newText),
    );
    await setTimeoutAsync(undefined, 500);
    while (true) {
      await this.writeText(
        'Je suis un développeur <red>front</red>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <blue>back</blue>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <green>fullstack</green>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <red>créatif</red>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <blue>rigoureux</blue>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <green>passionné</green>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <red>leader</red>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <blue>curieux</blue>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
      await this.writeText(
        'Je suis un développeur <green>organisé</green>',
        () => this.qualityText,
        (newText: string) => (this.qualityText = newText),
      );
      await setTimeoutAsync(undefined, 1000);
    }
  }

  async writeText(
    newText: string,
    getTextCallback: () => string,
    setTextCallback: (newText: string) => void,
  ): Promise<void> {
    const originalText = getTextCallback();
    while (this.qualityText !== '' && !newText.startsWith(this.qualityText)) {
      await setTimeoutAsync(() => {
        setTextCallback(this.eraseWithTags(this.qualityText, originalText));
      }, ERASE_SPEED);
    }

    if (newText.startsWith(getTextCallback())) {
      newText = newText.substring(this.qualityText.length, newText.length);
    }

    // Concat all mappingTag in one regex
    const tags = this.mappingTag.map((tag) => tag.id).join('|');
    const regex = new RegExp(`<(${tags})>(.*?)</\\1>`, 'g');

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(newText)) !== null) {
      const textBeforeTag = newText.substring(lastIndex, match.index);
      await this.writeNormalText(
        textBeforeTag,
        getTextCallback,
        setTextCallback,
      );

      const id = match[1];
      const textTagged = match[2];

      const tag =
        this.mappingTag.find((mapping) => mapping.id === id)?.tag ?? '';

      await this.writeColoredText(
        textTagged,
        tag,
        getTextCallback,
        setTextCallback,
      );

      lastIndex = regex.lastIndex;
    }

    const textAfterAllTag = newText.substring(lastIndex);
    await this.writeNormalText(
      textAfterAllTag,
      getTextCallback,
      setTextCallback,
    );
  }

  // Fonction pour écrire du texte normal
  private async writeNormalText(
    text: string,
    getTextCallback: () => string,
    setTextCallback: (newText: string) => void,
  ): Promise<void> {
    for (let i = 0; i < text.length; i++) {
      await setTimeoutAsync(() => {
        setTextCallback(getTextCallback() + text.charAt(i));
      }, WRITING_SPEED);
    }
  }

  // Fonction pour écrire du texte coloré avec le realTag
  private async writeColoredText(
    text: string,
    tag: string,
    getTextCallback: () => string,
    setTextCallback: (newText: string) => void,
  ): Promise<void> {
    setTextCallback(`${getTextCallback()}<span class="${tag}">`);
    await this.writeNormalText(text, getTextCallback, setTextCallback);
    setTextCallback(`${getTextCallback()}</span>`);
  }

  private eraseWithTags(text: string, originalText: string): string {
    const openingTagMatch = /<span class="[^"]+">$/.exec(text);

    if (text.endsWith('</span>')) {
      return text.slice(0, text.lastIndexOf('</span'));
    } else if (openingTagMatch) {
      return text.slice(0, openingTagMatch.index);
    }
    return originalText.slice(0, text.length - 1).trimEnd();
  }
}
