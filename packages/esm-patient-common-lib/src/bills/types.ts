interface CashPoint {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  location: Location;
}

interface Provider {
  uuid: string;
  display: string;
}

export interface LineItem {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  item: string;
  quantity: number;
  price: number;
  priceName: string;
  priceUuid: string;
  lineItemOrder: number;
  resourceVersion: string;
}

interface Patient {
  uuid: string;
  display: string;
}

interface AttributeType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  attributeOrder: number;
  format: string;
  foreignKey: string | null;
  regExp: string | null;
  required: boolean;
}

interface Attribute {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  value: string;
  attributeType: AttributeType;
  order: number;
  valueName: string;
  resourceVersion: string;
}

interface PaymentInstanceType {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
}

export interface Payment {
  uuid: string;
  instanceType: PaymentInstanceType;
  attributes: Attribute[];
  amount: number;
  amountTendered: number;
  dateCreated: number;
  voided: boolean;
  resourceVersion: string;
}

export interface PatientInvoice {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  adjustedBy: any[];
  billAdjusted: any;
  cashPoint: CashPoint;
  cashier: Provider;
  dateCreated: string;
  lineItems: LineItem[];
  patient: Patient;
  payments: Payment[];
  receiptNumber: string;
  status: string;
  adjustmentReason: any;
  id: number;
  resourceVersion: string;
}
