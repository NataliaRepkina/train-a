import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PopUpService {
  makeCapitalPopup(title: string): string {
    return `<div>Station: ${title}</div>`;
  }
}
