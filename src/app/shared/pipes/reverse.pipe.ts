import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverse',
})
export class ReversePipe implements PipeTransform {
  transform<T>(array: T[] | null): T[] | null {
    return array ? array.slice().reverse() : null;
  }
}
