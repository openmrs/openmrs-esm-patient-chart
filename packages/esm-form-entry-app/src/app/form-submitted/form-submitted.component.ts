import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

import { Order } from '../types';

@Component({
  selector: 'my-app-form-submitted',
  templateUrl: './form-submitted.component.html',
  styleUrls: ['./form-submitted.component.css'],
})
export class FormSubmittedComponent implements OnInit {
  @Input() orders: Array<Order>;
  @Output() cancelled = new EventEmitter();
  @Output() editRequested = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  cancel() {
    this.cancelled.emit();
  }
  edit() {
    this.editRequested.emit();
  }
}
