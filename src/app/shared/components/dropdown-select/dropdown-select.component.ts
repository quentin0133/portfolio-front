import {
  Component,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-dropdown-select',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule, NgClass],
  templateUrl: './dropdown-select.component.html',
  styleUrl: './dropdown-select.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownSelectComponent),
      multi: true,
    },
  ],
})
export class DropdownSelectComponent implements OnInit, ControlValueAccessor {
  @Input()
  label: string = '';

  @Input()
  name: string = '';

  @Input()
  options: string[] = [];

  @Output()
  onSelectedOption = new EventEmitter<string>();

  isOpen = false;
  currentOption: string = '';

  private onChangeCallback: (value: string) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  ngOnInit() {
    if (this.options.length > 0) {
      this.currentOption = this.options[0];
    }
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
    if (!this.isOpen)
      this.onTouched();
  }

  selectOption(newOption: string) {
    this.currentOption = newOption;
    this.onSelectedOption.emit(newOption);
    this.isOpen = false;
    this.onChangeCallback(
      this.currentOption != this.options[0] ? this.currentOption : '',
    );
  }

  closeDropdown() {
    console.log("Drop down close ")
    this.isOpen = false;
    this.onTouched();
  }

  @HostListener('document:focusin', ['$event'])
  onFocusChange(event: FocusEvent) {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isOpen) return;

    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  onTouched(): void {
    this.onTouchedCallback();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    if (this.options.length === 0) return;

    this.currentOption = this.options.includes(value) ? value : this.options[0];
  }
}
