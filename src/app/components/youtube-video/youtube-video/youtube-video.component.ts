import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { SafeUrlPipe } from '../../../pipe/safe-url/SafeUrl.pipe';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-youtube-video',
  standalone: true,
  imports: [SafeUrlPipe, NgIf],
  templateUrl: './youtube-video.component.html',
  styleUrl: './youtube-video.component.css',
})
export class YoutubeVideoComponent implements OnInit, OnDestroy {
  @ViewChild('youtubeContainer', { static: true })
  youtubeContainer!: ElementRef<HTMLDivElement>;

  @Input()
  videoId: string | undefined;

  @Input()
  autoplay: boolean = false;

  @Output()
  onReadyChange: EventEmitter<YT.PlayerEvent> = new EventEmitter();

  private player!: YT.Player;

  ngOnInit(): void {
    this.initializePlayer();
  }

  initializePlayer(): void {
    if (!this.videoId || !this.youtubeContainer) return;

    const onYouTubeIframeAPIReady = () => {
      this.player = new YT.Player(this.youtubeContainer.nativeElement, {
        videoId: this.videoId,
        playerVars: {
          autoplay: this.autoplay ? 1 : 0,
          controls: 2,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          cc_load_policy: 0,
          iv_load_policy: 3,
        },
      });
    };

    if (window['YT'] && window['YT'].Player) {
      onYouTubeIframeAPIReady();
    } else {
      // @ts-ignore
      window['onYouTubeIframeAPIReady'] = onYouTubeIframeAPIReady;
    }
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
      this.player = undefined!;
    }
  }
}
