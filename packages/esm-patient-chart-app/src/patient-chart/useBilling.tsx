import { type OpenmrsResource, openmrsFetch, showModal, useOpenmrsSWR, useVisit } from '@openmrs/esm-framework';
import { getWorkspaceStore } from '@openmrs/esm-patient-common-lib';
import sortBy from 'lodash-es/sortBy';
import { useEffect } from 'react';
import useSWR from 'swr';

type BillingInformation = {
  shouldPrompt: boolean;
};

type LineItem = {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  item: string;
  billableService: string;
  quantity: number;
  price: number;
  priceName: string;
  priceUuid: string;
  lineItemOrder: number;
  resourceVersion: string;
};

export type PatientInvoice = {
  uuid: string;
  display: string;
  voided: boolean;
  voidReason: string | null;
  adjustedBy: any[];
  billAdjusted: any;
  cashPoint: OpenmrsResource;
  cashier: OpenmrsResource;
  dateCreated: string;
  lineItems: Array<LineItem>;
  patient: OpenmrsResource;
  payments: Array<Payment>;
  receiptNumber: string;
  status: string;
  adjustmentReason: any;
  id: number;
  resourceVersion: string;
};

export type Payment = {
  uuid: string;
  instanceType: OpenmrsResource;
  attributes: Array<OpenmrsResource>;
  amount: number;
  amountTendered: number;
  dateCreated: number;
  voided: boolean;
  resourceVersion: string;
};

export const useBilling = (patientUuid) => {
  const { bills } = useBills(patientUuid);
  const { currentVisit } = useVisit(patientUuid);
  const attributes = currentVisit?.attributes;
  const billingInformation: BillingInformation =
    attributes?.find((attribute) => attribute.attributeType.uuid === '919b51c9-8e2e-468f-8354-181bf3e55786')?.value ??
    '';

  const flattendBills = bills.flatMap((bill) => bill.lineItems);
  const flattendPayments = bills.flatMap((bill) => bill.payments);

  const totalBill = flattendBills.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalPayments = flattendPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const patientBillBalance = totalBill - totalPayments;

  useEffect(() => {
    const shouldPromptForPayment =
      patientBillBalance > 0 && currentVisit?.visitType?.uuid === '3371a4d4-f66f-4454-a86d-92c7b3da990c';
    const store = getWorkspaceStore();
    const state = store.getState();
    store.setState({ ...state, promptBeforeOpening: Boolean(shouldPromptForPayment) });
  }, [patientBillBalance, currentVisit]);

  return { patientBillBalance, bills, billingInformation };
};

export const useBills = (patientUuid) => {
  const url = `/ws/rest/v1/cashier/bill?v=full`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<PatientInvoice> } }>(url, openmrsFetch);
  const bills = data?.data?.results ?? [];
  const patientBills = bills.filter((bill) => bill.patient.uuid === patientUuid);
  const sortedBills = sortBy(patientBills, 'dateCreated').reverse();
  return { isLoading, bills: sortedBills, error };
};
