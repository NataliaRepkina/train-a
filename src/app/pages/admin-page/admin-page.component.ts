import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.scss',
})
export class AdminPageComponent implements OnInit {
  public activeButtons: 'stations' | 'carriages' | 'routes' | '' = '';

  private path!: string[];

  constructor(private route: Router) {}

  ngOnInit(): void {
    this.path = this.route.url.split('/');
    this.activeButtons = this.path[2] ? (this.path[2] as 'stations' | 'carriages' | 'routes') : '';
  }

  public makeActive(activeButtons: 'stations' | 'carriages' | 'routes') {
    this.activeButtons = activeButtons;
  }
}
