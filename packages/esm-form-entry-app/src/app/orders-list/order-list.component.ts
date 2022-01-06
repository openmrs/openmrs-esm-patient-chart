import { Component, Input, OnInit } from '@angular/core';

import { Order } from '../types';

@Component({
  selector: 'order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  @Input() public orders: Array<Order>;

  ngOnInit(): void {}
}
