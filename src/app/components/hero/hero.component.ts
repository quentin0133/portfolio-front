import { AfterViewInit, Component } from '@angular/core';
import { NgForOf, NgIf, NgStyle } from '@angular/common';
import { TerminalComponent } from '../info-box/terminal/terminal.component';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { setTimeoutAsync } from '../../tools/js-native-utils';

const WRITING_SPEED = 45;
const ERASE_SPEED = 45;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgForOf, NgStyle, TerminalComponent, NgIf],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  animations: [
    trigger('openFromTop', [
      state(
        'blurred',
        style({ height: '*', filter: 'blur(2px) brightness(50%)' }),
      ),
      state('open', style({ height: '*', filter: 'blur(0)' })),
      state('close', style({ height: '0', filter: 'blur(0)' })),
      transition('close => open', [animate('1.5s')]),
      transition('open => blurred', [animate('1s')]),
    ]),
  ],
})
export class HeroComponent implements AfterViewInit {
  state: string = 'close';
  text: string = '';
  private readonly mappingTag = [
    { id: 'blue', tag: 'text-blue-300' },
    { id: 'red', tag: 'text-red-500' },
    { id: 'green', tag: 'text-green-500' },
  ];

  async ngAfterViewInit(): Promise<void> {
    await setTimeoutAsync(undefined, 150);
    this.state = 'open';
    await setTimeoutAsync(undefined, 2000);
    this.state = 'blurred';
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Bienvenue sur le portfolio de Quentin YAHIA');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <red>front</red>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <blue>back</blue>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>fullstack</green>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>créatif</green>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>rigoureux</green>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>passionné</green>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>leader</green>');
    await setTimeoutAsync(undefined, 1500);
    await this.writeText('Un développeur <green>curieux</green>');
  }

  async writeText(newText: string): Promise<void> {
    let originalText = this.text;
    while (this.text !== '' && !newText.startsWith(this.text)) {
      await setTimeoutAsync(() => {
        this.text = this.eraseWithTags(this.text, originalText);
      }, ERASE_SPEED);
    }

    if (newText.startsWith(this.text)) {
      newText = newText.substring(this.text.length, newText.length);
    }

    // Concat all mappingTag in one regex
    const tags = this.mappingTag.map((tag) => tag.id).join('|');
    const regex = new RegExp(`<(${tags})>(.*?)<\/\\1>`, 'g');

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(newText)) !== null) {
      const textBeforeTag = newText.substring(lastIndex, match.index);
      await this.writeNormalText(textBeforeTag);

      const id = match[1];
      const textTagged = match[2];

      const tag =
        this.mappingTag.find((mapping) => mapping.id === id)?.tag ?? '';

      await this.writeColoredText(textTagged, tag);

      lastIndex = regex.lastIndex;
    }

    const textAfterAllTag = newText.substring(lastIndex);
    await this.writeNormalText(textAfterAllTag);
  }

  // Fonction pour écrire du texte normal
  private async writeNormalText(text: string): Promise<void> {
    for (let i = 0; i < text.length; i++) {
      await setTimeoutAsync(() => {
        this.text += text.charAt(i);
      }, WRITING_SPEED);
    }
  }

  // Fonction pour écrire du texte coloré avec le realTag
  private async writeColoredText(text: string, tag: string): Promise<void> {
    this.text += `<span class="${tag}">`;
    for (let i = 0; i < text.length; i++) {
      await setTimeoutAsync(() => {
        this.text += text.charAt(i);
      }, WRITING_SPEED);
    }
    this.text += `</span>`;
  }

  private eraseWithTags(text: string, originalText: string): string {
    const openingTagMatch = /<span class="[^"]+">$/.exec(text);

    if (text.endsWith('</span>')) {
      console.log(text.slice(0, text.lastIndexOf('</span')));
      return text.slice(0, text.lastIndexOf('</span'));
    } else if (openingTagMatch) return text.slice(0, openingTagMatch.index);
    return originalText.slice(0, text.length - 1).trimEnd();
  }
}
