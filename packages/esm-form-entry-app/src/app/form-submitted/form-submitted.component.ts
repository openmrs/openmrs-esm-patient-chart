import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'my-app-form-submitted',
  templateUrl: './form-submitted.component.html',
  styleUrls: ['./form-submitted.component.css'],
})
export class FormSubmittedComponent implements OnInit {
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
