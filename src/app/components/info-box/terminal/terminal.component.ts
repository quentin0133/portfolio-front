import { Component, Input, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import { state, style, trigger } from '@angular/animations';
import { setTimeoutAsync } from '../../../tools/js-native-utils';

const WRITING_SPEED = 45;
const ERASE_SPEED = 25;

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css',
  animations: [
    trigger('blinkCursor', [
      state(
        'visible',
        style({
          opacity: 1,
        }),
      ),
      state(
        'invisible',
        style({
          opacity: 0,
        }),
      ),
    ]),
  ],
})
export class TerminalComponent implements OnInit {
  @Input()
  top: string = 'calc(50% - 300px)';
  @Input()
  left: string = 'calc(50% - 400px)';
  @Input()
  width: string = '900px';
  @Input()
  height: string = '500px';
  @Input()
  title: string = 'Terminal.exe';
  @Input()
  label: string = 'C:\\';
  @Input()
  note: string = '';

  private readonly mappingTag = [
    { id: 'blue', tag: 'text-blue-300' },
    { id: 'red', tag: 'text-red-500' },
    { id: 'strong', tag: 'font-bold' },
  ];
  cursorState: string = 'visible';
  lines: string[] = [];
  text: string = '';

  ngOnInit(): void {
    setInterval(() => {
      this.cursorState =
        this.cursorState === 'visible' ? 'invisible' : 'visible';
    }, 500);
  }

  async writeText(newText: string): Promise<void> {
    let originalText = this.text;
    // Erase the ancient text
    for (let i = 0; i < originalText.length; i++) {
      await setTimeoutAsync(() => {
        this.text = originalText.substring(0, originalText.length - i - 1);
      }, ERASE_SPEED);
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
}
