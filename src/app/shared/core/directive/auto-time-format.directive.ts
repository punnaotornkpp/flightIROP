import { Directive, HostListener, ElementRef, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[autoTimeFormat]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoTimeFormatDirective),
      multi: true,
    },
  ],
})
export class AutoTimeFormatDirective implements ControlValueAccessor {
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    const cleaned = value.replace(/\D/g, ''); // เอาเฉพาะตัวเลข

    if (cleaned.length >= 3 && cleaned.length <= 4) {
      const hours = cleaned.substring(0, 2);
      const minutes = cleaned.substring(2, 4);
      const formatted = `${hours}:${minutes || ''}`;
      this.el.nativeElement.value = formatted;
      this.onChange(formatted);
    } else {
      this.el.nativeElement.value = value;
      this.onChange(value);
    }
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
  }

  // ControlValueAccessor implementations
  writeValue(value: any): void {
    this.el.nativeElement.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
