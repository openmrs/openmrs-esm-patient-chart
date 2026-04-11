import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SingleSpaPropsService } from './single-spa-props/single-spa-props.service';

@Component({
  selector: 'my-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'openmrs-esm-form-entry';
  view: string;
  private sub: Subscription;

  constructor(private readonly singleSpaPropsService: SingleSpaPropsService) {}

  ngOnInit(): void {
    this.sub = this.singleSpaPropsService.props$.subscribe({
      next: (prop) => {
        this.view = prop.view;
      },
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
