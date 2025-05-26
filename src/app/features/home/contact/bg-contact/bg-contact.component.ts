import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {BgDarkContactService} from "./bg-dark-contact.service";
import {BgLightContactService} from "./bg-light-contact.service";
import {Subscription} from "rxjs";
import {ThemeService} from "../../../../shared/services/theme/theme.service";

@Component({
  selector: 'app-bg-contact',
  standalone: true,
  imports: [],
  templateUrl: './bg-contact.component.html',
  styleUrl: './bg-contact.component.css',
})
export class BgContactComponent implements OnInit, AfterViewInit, OnDestroy {
  private visibilityObserver: IntersectionObserver | undefined;
  private isVisible: boolean = false;
  private service: any;

  private themeChangeSubscription!: Subscription;

  constructor(
    private readonly bgDarkContactService: BgDarkContactService,
    private readonly bgLightContactService: BgLightContactService,
    private readonly elementRef: ElementRef,
    private readonly themeService: ThemeService,
  ) {
  }

  ngOnInit() {
    this.service = this.themeService.isDarkThemePreferred()
      ? this.bgDarkContactService
      : this.bgLightContactService;
  }

  ngAfterViewInit(): void {
    this.themeChangeSubscription = this.themeService.isDarkMode.subscribe(
      (isDarkMode) => {
        this.service.cleanUp();
        this.service = isDarkMode
          ? this.bgDarkContactService
          : this.bgLightContactService;
        this.updateShading();
      },
    );

    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
        this.updateShading();
      },
      { threshold: 0.1 }, // 10% visible = déclenchement
    );

    this.visibilityObserver.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.visibilityObserver?.disconnect();
    this.visibilityObserver = undefined;
    this.bgLightContactService.cleanUp();
    this.bgDarkContactService.cleanUp();
    this.themeChangeSubscription.unsubscribe();
  }

  private updateShading() {
    if (this.isVisible) {
      this.service
        .initThreeJS(this.elementRef)
        .then(() => this.service.animate());
    } else {
      this.service.cleanUp();
    }
  }
}
