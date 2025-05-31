import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { YoutubeVideoComponent } from '../youtube-video/youtube-video.component';

@Component({
  selector: 'app-modal-video',
  standalone: true,
  imports: [NgClass, NgIf, YoutubeVideoComponent],
  templateUrl: './modal-video.component.html',
  styleUrl: './modal-video.component.css',
})
export class ModalVideoComponent {
  @Input()
  showVideoModal: boolean = false;

  @Output()
  showVideoModalChange: EventEmitter<boolean> = new EventEmitter();

  @Input()
  title: string = '';

  @Input()
  videoId: string | undefined;

  closeModal() {
    this.showVideoModal = false;
    this.showVideoModalChange.emit(this.showVideoModal);
  }

  onPlayerReady(event: YT.PlayerEvent) {
    event.target.playVideo();
  }
}
