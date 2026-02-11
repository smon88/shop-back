import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'copCurrency',
  standalone: true,
})
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';

    const rounded = Math.round(value);
    const str = rounded.toString();

    // Add periods every 3 digits from right
    let formatted = '';
    for (let i = str.length - 1, count = 0; i >= 0; i--, count++) {
      if (count > 0 && count % 3 === 0) {
        formatted = '.' + formatted;
      }
      formatted = str[i] + formatted;
    }

    // Replace first period with apostrophe for millions
    const parts = formatted.split('.');
    if (parts.length >= 3) {
      formatted = parts[0] + "'" + parts.slice(1).join('.');
    }

    return `$${formatted}COP`;
  }
}
