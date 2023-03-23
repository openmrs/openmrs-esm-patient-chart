import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { singleSpaPropsSubject } from '../single-spa-props';

@Component({
  selector: 'my-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ampath-esm-angular-form-entry';
  view: string;
  sub: Subscription;
  constructor() {}
  ngOnInit(): void {
    this.sub = singleSpaPropsSubject.subscribe(
      (prop) => {
        this.view = prop.view;
      },
      (err) => {},
    );
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
