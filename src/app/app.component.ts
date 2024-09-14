import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { getUser } from './core/store/user/user.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'train';

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.store.dispatch(getUser());
    }
  }
}
