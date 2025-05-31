import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BgDarkAboutMeService } from './bg-dark-about-me.service';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../../shared/services/theme/theme.service';
import { Application, Assets, Sprite, Ticker } from 'pixi.js';

@Component({
  selector: 'app-bg-about-me',
  standalone: true,
  imports: [],
  templateUrl: './bg-about-me.component.html',
  styleUrl: './bg-about-me.component.css',
})
export class BgAboutMeComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly BG_TEXT_PATH: string = '/assets/time/bg-about-me-time.webp';
  readonly SUN_TEXT_PATH: string = '/assets/time/sun/sun.webp';
  readonly HALO_TEXT_PATH: string = '/assets/time/sun/halo.webp';

  @ViewChild('pixiContainer')
  pixiContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('darkThemeCanvas')
  darkThemeCanvas!: ElementRef<HTMLCanvasElement>;

  private intersectionSubscription?: IntersectionObserver;
  private canvas?: HTMLCanvasElement;
  private isLocked = false;

  app: Application = new Application();
  isAppInit: boolean = false;

  isDark!: boolean;
  isVisible!: boolean;

  themeSubscription!: Subscription;

  sun?: Sprite;
  halo?: Sprite;

  sunAnimationCallback: (time: Ticker) => void =
    this.lightModeTicker.bind(this);

  constructor(
    private readonly bgDarkModeContactService: BgDarkAboutMeService,
    private readonly themeService: ThemeService,
    private readonly elementRef: ElementRef,
  ) {}

  ngOnInit() {
    this.isDark = this.themeService.isDarkThemePreferred();
    this.themeSubscription = this.themeService.isDarkMode.subscribe(
      (isDarkTheme) => {
        this.isDark = isDarkTheme;
        setTimeout(() =>
          this.updateBackgroundSafe(this.isVisible, this.isDark),
        );
      },
    );
  }

  ngAfterViewInit(): void {
    this.intersectionSubscription = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
        this.updateBackgroundSafe(this.isVisible, this.isDark);
      },
      { threshold: 0.1 }, // 80% visible = trigger
    );

    this.intersectionSubscription.observe(this.elementRef.nativeElement);
  }

  async ngOnDestroy() {
    this.bgDarkModeContactService.cleanUp();
    await this.clearLight();
    this.intersectionSubscription?.disconnect();
    this.intersectionSubscription = undefined;
  }

  private async updateBackground(isVisible: boolean, isDark: boolean) {
    this.bgDarkModeContactService.cleanUp();
    await this.clearLight();

    for (let child of [...this.app.stage.children]) {
      child.destroy(true);
    }

    if (isVisible) {
      if (isDark) {
        this.bgDarkModeContactService.initThreeJS(this.darkThemeCanvas);
        this.bgDarkModeContactService.animate();
      } else {
        await this.haloEffect();
        this.app.ticker?.add(this.sunAnimationCallback);
      }
    }
  }

  private async haloEffect() {
    if (!this.isAppInit) {
      await this.app.init({
        background: '#0a0a0a',
        resizeTo: this.pixiContainer.nativeElement,
      });

      this.isAppInit = true;
    }

    this.canvas = this.pixiContainer.nativeElement.appendChild(this.app.canvas);

    const bg = new Sprite(await Assets.load(this.BG_TEXT_PATH));

    const scaleX = this.app.screen.width / bg.texture.width;
    const scaleY = this.app.screen.height / bg.texture.height;
    const scale = Math.max(scaleX, scaleY);

    bg.scale.set(scale);
    bg.anchor.set(0.5);

    bg.x = this.app.screen.width / 2;
    bg.y = this.app.screen.height / 2;

    this.app.stage.addChild(bg);

    this.sun = new Sprite(await Assets.load(this.SUN_TEXT_PATH));
    this.sun.anchor.set(0.5);
    this.sun.x = this.app.screen.width / 2;
    this.sun.y = this.app.screen.height / 2;

    this.halo = new Sprite(await Assets.load(this.HALO_TEXT_PATH));
    this.halo.anchor.set(0.5);
    this.halo.x = this.app.screen.width / 2;
    this.halo.y = this.app.screen.height / 2;

    this.app.stage.addChild(this.sun);
    this.app.stage.addChild(this.halo);
  }

  lightModeTicker(time: Ticker): void {
    if (!this.sun || !this.halo || this.sun.destroyed || this.halo.destroyed)
      return;

    const scale = 0.6 + Math.sin(performance.now() / 5000) * 0.1;
    this.sun.scale.set(scale);
    this.halo.alpha =
      0.25 + Math.abs(Math.sin(performance.now() / 5000)) * 0.75;
  }

  async clearLight() {
    this.app.ticker?.remove(this.sunAnimationCallback);
    if (Assets.cache.has(this.BG_TEXT_PATH))
      await Assets.unload(this.BG_TEXT_PATH);
    if (Assets.cache.has(this.SUN_TEXT_PATH))
      await Assets.unload(this.SUN_TEXT_PATH);
    if (Assets.cache.has(this.HALO_TEXT_PATH))
      await Assets.unload(this.HALO_TEXT_PATH);
    this.canvas?.remove();
    this.canvas = undefined;
  }

  async updateBackgroundSafe(isVisible: boolean, isDark: boolean) {
    while (this.isLocked) {
      await this.delay(10);
    }

    this.isLocked = true;

    try {
      await this.updateBackground(isVisible, isDark);
    } finally {
      this.isLocked = false;
    }
  }

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
