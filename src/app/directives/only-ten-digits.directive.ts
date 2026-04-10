import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[onlyTenDigits]',
  standalone: true
})
export class OnlyTenDigitsDirective {

  constructor(private control: NgControl) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/[^0-9]/g, '');

    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    this.control.control?.setValue(value);
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];

    if (input.value.length >= 10 && !allowedKeys.includes(event.key) && !event.ctrlKey) {
      event.preventDefault();
    }

    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key) && !event.ctrlKey) {
      event.preventDefault();
    }
  }
}