import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'range',
  standalone: true,
})
export class RangePipe implements PipeTransform {
  transform(value: number | undefined): number[] {
    return value ? Array.from({ length: value }, (_, i) => i) : [];
  }
}
