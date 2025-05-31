import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import {
  Application,
  Assets,
  Container,
  Sprite,
  Texture,
  Ticker,
} from 'pixi.js';
import { getRandomArbitrary } from '../../../../shared/tools/js-native-utils';
import { ThemeService } from '../../../../shared/services/theme/theme.service';
import { Subscription } from 'rxjs';
import { lerp } from 'three/src/math/MathUtils.js';

@Component({
  selector: 'app-bg-projects',
  standalone: true,
  imports: [],
  templateUrl: './bg-projects.component.html',
  styleUrl: './bg-projects.component.css',
})
export class BgProjectsComponent implements AfterViewInit, OnDestroy {
  readonly STAR_TEXTURE_PATH: string = '/assets/space/star.webp';
  readonly BG_LIGHT_TEXTURE_PATH: string = '/assets/time/bg-projects-time.webp';
  readonly CLOUD_1_TEXTURE_PATH: string = '/assets/time/clouds/cloud_1.webp';
  readonly CLOUD_2_TEXTURE_PATH: string = '/assets/time/clouds/cloud_2.webp';
  readonly CLOUD_3_TEXTURE_PATH: string = '/assets/time/clouds/cloud_3.webp';
  readonly SCROLL_HEIGHT: number = 300;

  @ViewChild('pixiContainer', { static: true })
  pixiContainer!: ElementRef<HTMLDivElement>;

  private visibleObserver: IntersectionObserver | undefined;
  private themeObserver: Subscription | undefined;
  private isLocked = false;

  app: Application = new Application();
  canvas?: HTMLCanvasElement;
  isAppInit: boolean = false;

  starsData: StarData[] = [];
  starContainer?: Container<any>;

  clouds: Sprite[] = [];
  cloudContainer?: Container<any>;

  isVisible: boolean = false;
  isDarkMode!: boolean;

  starFallAnimationCallback: (time: Ticker) => void =
    this.darkModeTicker.bind(this);
  cloudAnimationCallback: (time: Ticker) => void =
    this.lightModeTicker.bind(this);

  constructor(
    private readonly elementRef: ElementRef,
    private readonly themeService: ThemeService,
  ) {}

  ngAfterViewInit(): void {
    this.app
      .init({
        background: '#0a0a0a',
        resizeTo: this.pixiContainer.nativeElement,
      })
      .then(() => {
        this.canvas = this.pixiContainer.nativeElement.appendChild(
          this.app.canvas,
        );

        this.isAppInit = true;

        this.updateBackgroundSafe(this.isVisible, this.isDarkMode);
      });

    this.isDarkMode = this.themeService.isDarkThemePreferred();
    this.themeObserver = this.themeService.isDarkMode.subscribe(
      (isDarkMode) => {
        this.isDarkMode = isDarkMode;
        this.updateBackgroundSafe(this.isVisible, this.isDarkMode);
      },
    );

    this.visibleObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;

        this.updateBackgroundSafe(this.isVisible, this.isDarkMode);
      },
      { threshold: 0.1 },
    );

    this.visibleObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.isVisible = false;
    this.visibleObserver?.disconnect();
    this.themeObserver?.unsubscribe();
    Promise.all([this.clearLight(), this.clearDark()]).then(() => {
      for (let child of this.app.stage.children) {
        child.destroy(true);
      }
      this.canvas?.remove();
      this.canvas = undefined;
      this.app.destroy(true, { children: true, texture: true });
    });
  }

  private async fallingStarsEffect(numStars: number): Promise<void> {
    if (this.starContainer) {
      return;
    }

    this.starContainer = new Container();
    this.app.stage.addChild(this.starContainer);

    const texture = await Assets.load(this.STAR_TEXTURE_PATH);

    const cols = Math.ceil(Math.sqrt(numStars));
    const rows = Math.ceil(numStars / cols);
    const cellWidth = this.app.screen.width / cols;
    const cellHeight = this.app.screen.height / rows;

    for (let i = 0; i < numStars; i++) {
      const star = new Sprite(texture);

      const col = i % cols;
      const row = Math.floor(i / cols);

      star.x =
        col * cellWidth + getRandomArbitrary(-cellWidth / 2, cellWidth / 2);
      star.y =
        row * cellHeight + getRandomArbitrary(-cellHeight / 2, cellHeight / 2);

      const size = getRandomArbitrary(0.3, 0.45);
      star.scale.set(size, size);
      star.tint = {
        r: getRandomArbitrary(0, 255),
        g: getRandomArbitrary(0, 255),
        b: getRandomArbitrary(0, 255),
      };

      this.starContainer.addChild(star);

      this.starsData.push({
        sprite: star,
        speed: getRandomArbitrary(0.5, 1.3),
        colorSpeed: getRandomArbitrary(1500, 2500),
        delay: getRandomArbitrary(2, 12),
        alpha: getRandomArbitrary(0.25, 1),
      });
    }
  }

  private async cloudEffect() {
    if (this.cloudContainer) return;

    const bg = new Sprite(await Assets.load(this.BG_LIGHT_TEXTURE_PATH));

    const scaleX = this.app.screen.width / bg.texture.width;
    const scaleY = this.app.screen.height / bg.texture.height;
    const scale = Math.max(scaleX, scaleY);
    bg.scale.set(scale);
    bg.anchor.set(0.5);

    bg.x = this.app.screen.width / 2;
    bg.y = this.app.screen.height / 2;

    this.app.stage.addChild(bg);

    this.cloudContainer = new Container();
    this.cloudContainer.y = this.app.screen.height / 2 + 175;
    this.app.stage.addChild(this.cloudContainer);

    const clouds: Texture[] = [
      await Assets.load(this.CLOUD_1_TEXTURE_PATH),
      await Assets.load(this.CLOUD_2_TEXTURE_PATH),
      await Assets.load(this.CLOUD_3_TEXTURE_PATH),
    ];

    const numClouds = 40;
    const gridX = 10;
    const gridY = numClouds / gridX;

    const screenW = this.app.screen.width;

    for (let i = 0; i < gridY; i++) {
      let yBase = (this.SCROLL_HEIGHT * i) / gridY;
      for (let j = 0; j < gridX; j++) {
        const cloudSprite = new Sprite(
          clouds[Math.floor(Math.random() * clouds.length)],
        );
        cloudSprite.anchor.set(0.5);
        if (Math.random() > 0.5) cloudSprite.scale.x *= -1;

        cloudSprite.y = yBase + Math.random() * 50 - 100;
        cloudSprite.x = (screenW * j) / (gridX - 1);

        this.cloudContainer.addChild(cloudSprite);
        this.clouds.push(cloudSprite);
      }
    }
  }

  lightModeTicker(time: Ticker): void {
    if (!this.cloudContainer || this.cloudContainer.destroyed) return;

    for (let cloud of this.clouds) {
      if (!cloud || cloud.destroyed) return;

      let scale = lerp(0.1, 1.1, cloud.y / this.SCROLL_HEIGHT);

      cloud.y += lerp(0.05, 0.4, cloud.y / this.SCROLL_HEIGHT) * time.deltaTime;
      cloud.scale.set(scale * Math.sign(cloud.scale.x), scale);
      if (cloud.y < 50) {
        cloud.alpha = lerp(0, 0.65, cloud.y / 50);
      } else if (cloud.y > this.SCROLL_HEIGHT - 50) {
        cloud.alpha = lerp(0.65, 0, (cloud.y - (this.SCROLL_HEIGHT - 50)) / 50);
      } else {
        cloud.alpha = 0.65;
      }
      if (cloud.y > this.SCROLL_HEIGHT) {
        cloud.y -= this.SCROLL_HEIGHT;
      }
    }

    this.cloudContainer.children.sort((a, b) => a.y - b.y);
  }

  darkModeTicker(time: Ticker): void {
    for (const element of this.starsData) {
      let star = element;
      star.sprite.alpha = lerp(
        0,
        star.alpha,
        Math.sin(performance.now() / star.colorSpeed + star.delay) + 0.4,
      );
      star.sprite.x += time.deltaTime * 0.7 * star.speed;
      star.sprite.y += time.deltaTime * 0.7 * star.speed;

      if (star.sprite.x > this.app.screen.width) {
        star.sprite.x = -star.sprite.width;
      }

      if (star.sprite.y > this.app.screen.height) {
        star.sprite.y = -star.sprite.height;
      }
    }
  }

  private async updateBackground(isVisible: boolean, isDark: boolean) {
    await this.clearDark();
    await this.clearLight();
    for (let child of [...this.app.stage.children]) {
      child.destroy(true);
    }

    if (isVisible) {
      if (isDark) {
        await this.fallingStarsEffect(150);
        this.app.ticker?.add(this.starFallAnimationCallback);
      } else {
        await this.cloudEffect();
        this.app.ticker?.add(this.cloudAnimationCallback);
      }
    }
  }

  async clearDark() {
    this.app.ticker?.remove(this.starFallAnimationCallback);
    this.starsData = [];
    if (Assets.cache.has(this.STAR_TEXTURE_PATH))
      await Assets.unload(this.STAR_TEXTURE_PATH);
    this.starContainer = undefined;
  }

  async clearLight() {
    this.app.ticker?.remove(this.cloudAnimationCallback);
    this.clouds = [];
    if (Assets.cache.has(this.BG_LIGHT_TEXTURE_PATH))
      await Assets.unload(this.BG_LIGHT_TEXTURE_PATH);
    if (Assets.cache.has(this.CLOUD_1_TEXTURE_PATH))
      await Assets.unload(this.CLOUD_1_TEXTURE_PATH);
    if (Assets.cache.has(this.CLOUD_2_TEXTURE_PATH))
      await Assets.unload(this.CLOUD_2_TEXTURE_PATH);
    if (Assets.cache.has(this.CLOUD_3_TEXTURE_PATH))
      await Assets.unload(this.CLOUD_3_TEXTURE_PATH);
    this.cloudContainer = undefined;
  }

  async updateBackgroundSafe(isVisible: boolean, isDark: boolean) {
    if (!this.isAppInit) return;

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

interface StarData {
  sprite: Sprite;
  speed: number;
  colorSpeed: number;
  delay: number;
  alpha: number
}
