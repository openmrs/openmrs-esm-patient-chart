import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { singleSpaPropsSubject } from '../single-spa-props';

@Component({
  selector: 'my-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'openmrs-esm-form-entry';
  view: string;
  sub: Subscription;
  constructor() {}
  ngOnInit(): void {
    this.sub = singleSpaPropsSubject.subscribe({
      next: (prop) => {
        this.view = prop.view;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
