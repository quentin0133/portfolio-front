import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent implements ControlValueAccessor {
  @Input()
  name!: string;

  @Input()
  id!: string;

  @Input()
  maxlength?: string;

  @Input()
  placeholder: string = '';

  @Input()
  label: string = '';

  @Input()
  value: string = '';

  isFocus: boolean = false;

  private onChangeCallback: (value: string) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  onChange(event: Event): void {
    const newValue = (event.target as HTMLInputElement).value;
    this.value = newValue;
    this.onChangeCallback(newValue);
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
    this.value = value || '';
  }

  onBlur() {
    this.isFocus = false;
    this.onTouched();
  }

  onFocus() {
    this.isFocus = true;
  }
}
