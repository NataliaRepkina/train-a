import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';
import { signOut } from '../../../core/store/user/user.actions';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  @Input() role!: string;

  @Input() isMobile!: boolean;

  @Output() closeMenu: EventEmitter<void> = new EventEmitter<void>();

  constructor(private store: Store) {}

  protected navLinks = {
    guest: { home: '/', signup: '/signup', signin: '/signin' },
    user: { profile: '/profile', orders: '/orders' },
    admin: { panel: '/admin' },
  };

  protected logout(): void {
    this.store.dispatch(signOut());
    if (this.isMobile) {
      this.closeMenu.emit();
    }
  }

  protected onLinkClick(): void {
    if (this.isMobile) {
      this.closeMenu.emit(); // Закрываем меню при клике на ссылку
    }
  }
}
