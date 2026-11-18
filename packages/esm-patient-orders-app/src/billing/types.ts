export interface ServicePrice {
  uuid: string;
  name: string;
  price: number;
}

export interface BillableService {
  uuid: string;
  name: string;
  shortName?: string;
  serviceStatus?: string;
  serviceType?: { uuid: string; display: string };
  servicePrices: ServicePrice[];
}

export interface PaymentMode {
  uuid: string;
  name: string;
  description?: string;
  retired?: boolean;
}

export interface CashPoint {
  uuid: string;
  name: string;
  retired?: boolean;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'CREDITED' | 'POSTED' | 'EXEMPTED';

export interface BillLineItem {
  uuid?: string;
  display?: string;
  billableService?: string | { uuid: string; name?: string };
  item?: string;
  quantity: number;
  price: number;
  priceName?: string;
  priceUuid?: string;
  lineItemOrder?: number;
  paymentStatus: PaymentStatus;
}

export interface BillPayment {
  uuid?: string;
  instanceType: string; // payment mode uuid
  amount: number;
  amountTendered: number;
  attributes?: unknown[];
}

export interface Bill {
  uuid?: string;
  display?: string;
  cashPoint?: string | CashPoint;
  cashier?: string | { uuid: string; display?: string };
  patient?: string | { uuid: string; display?: string };
  status: PaymentStatus;
  receiptNumber?: string;
  dateCreated?: string;
  lineItems: BillLineItem[];
  payments: BillPayment[];
  totalAmount?: number;
}

/** Shape of a new line item we add to a payment request. */
export interface NewLineItem {
  billableServiceUuid: string;
  price: number;
  priceUuid?: string;
  priceName?: string;
  quantity?: number;
}
