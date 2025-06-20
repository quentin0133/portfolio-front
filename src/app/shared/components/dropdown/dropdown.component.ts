import {
  AfterViewInit,
  Component,
  ContentChild,
  ContentChildren,
  ElementRef,
  HostListener, QueryList,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {NgClass, NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass],
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.css',
})
export class DropdownComponent implements AfterViewInit {
  @ContentChild('label')
  labelTemplate!: TemplateRef<any>;

  @ViewChild('button') buttonRef!: ElementRef<HTMLDivElement>;

  @ViewChild('dropdown') dropdownRef!: ElementRef<HTMLDivElement>;

  @ContentChildren('optionRef', { descendants: true }) optionsRaw!: QueryList<
    ElementRef<HTMLElement>
  >;

  isDropdown: boolean = false;

  ngAfterViewInit(): void {
    this.dropdownRef.nativeElement.style.top = this.buttonRef.nativeElement.getBoundingClientRect().height + 'px';
  }

  toggleDropdown() {
    this.isDropdown = !this.isDropdown;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as Node;

    const clickedInsideButton = this.buttonRef.nativeElement.contains(target);
    const clickedInsideDropdown =
      this.dropdownRef.nativeElement.contains(target);

    if (!clickedInsideButton && !clickedInsideDropdown) {
      this.isDropdown = false;
    }
  }
}
