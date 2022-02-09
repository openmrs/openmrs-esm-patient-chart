import { Component, Input } from '@angular/core';

@Component({
  selector: 'loader',
  templateUrl: './loader.component.html',
})
export class LoaderComponent {
  @Input()
  loadingMessage: string;
}
