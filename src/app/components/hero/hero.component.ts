import {AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage, NgStyle} from '@angular/common';
import { setTimeoutAsync } from '../../tools/js-native-utils';
import { ClockComponent } from '../clock/clock.component';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../services/theme/theme.service';
import { BgDarkModeHeroComponent } from '../bg-dark-mode-hero/bg-dark-mode-hero.component';

const WRITING_SPEED = 65;
const ERASE_SPEED = 65;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    NgForOf,
    NgStyle,
    NgIf,
    ClockComponent,
    ThemeTogglerComponent,
    BgDarkModeHeroComponent,
    NgOptimizedImage,
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  encapsulation: ViewEncapsulation.Emulated
})
export class HeroComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly mappingTag = [
    { id: 'blue', tag: 'text-blue-400' },
    { id: 'red', tag: 'text-red-500' },
    { id: 'green', tag: 'text-green-500' },
  ];

  isRunning: boolean = true;

  texts: string[] = [
    'Un développeur <red>front</red>',
    'Un développeur <blue>back</blue>',
    'Un développeur <green>fullstack</green>',
    'Un développeur <red>créatif</red>',
    'Un développeur <blue>rigoureux</blue>',
    'Un développeur <green>passionné</green>',
    'Un développeur <red>leader</red>',
    'Un développeur <blue>curieux</blue>',
    'Un développeur <green>organisé</green>',
  ];

  private themeChangeSubscription: Subscription | undefined;

  welcomeText: string = '';
  qualityText: string = '';

  isDarkMode: boolean = false;

  constructor(private readonly themeService: ThemeService) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.isDarkThemePreferred();
    this.themeChangeSubscription = this.themeService.isDarkMode.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
      },
    );
  }

  ngOnDestroy() {
    if (this.themeChangeSubscription) {
      this.themeChangeSubscription.unsubscribe();
    }
    this.isRunning = false;
  }

  async ngAfterViewInit(): Promise<void> {
    await setTimeoutAsync(undefined, 1500);
    await this.writeText(
      'Hey ! Je suis Quentin',
      () => this.welcomeText,
      (newText: string) => (this.welcomeText = newText),
    );
    await setTimeoutAsync(undefined, 500);
    this.loopWhoAmI();
  }

  async loopWhoAmI(): Promise<void> {
    for (let i = 0; this.isRunning; i = (i + 1) % this.texts.length) {
      await this.writeText(
        this.texts[i],
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
