import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tag, Tile } from '@carbon/react';
import { Money, Send } from '@carbon/react/icons';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { type OrderBasketExtensionProps, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import type { PaymentManagerConfig } from '../config-schema';
import { createLocalBill, useBillableServices, type LocalLineItem } from '../billing/billing.resource';
import type { BillableService, ServicePrice } from '../billing/types';
import styles from './order-payment-panel.scss';

interface PricedOrder {
  display: string;
  service?: BillableService;
  price?: ServicePrice;
}

/**
 * Mounted in `order-basket-slot`. For every drug/lab order a clinician adds to
 * the basket it shows the matching billable-service price and lets them send a
 * payment request (a PENDING bill) to the cashier queue. The patient must pay
 * before the order is dispensed/collected.
 *
 * NOTE: orders are matched to billable services by name (case-insensitive
 * contains). Configure billable services whose names match your drugs/tests
 * for prices to resolve.
 */
function OrderPaymentPanelExtension({ patient }: OrderBasketExtensionProps) {
  const { t } = useTranslation();
  const config = useConfig<PaymentManagerConfig>();
  const session = useSession();
  const { orders } = useOrderBasket(patient);
  const { billableServices, isLoading } = useBillableServices();
  const [submitting, setSubmitting] = useState(false);

  const currencyFmt = (value: number) => `${config.defaultCurrency} ${new Intl.NumberFormat().format(value ?? 0)}`;

  const pricedOrders = useMemo<PricedOrder[]>(() => {
    const payableOrders = (orders ?? []).filter((o) => !o.action || o.action === 'NEW' || o.action === 'RENEW');
    return payableOrders.map((order) => {
      const name = String(order.display ?? '').toLowerCase();
      const service = billableServices.find(
        (s) => name && (name.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(name)),
      );
      const price = service?.servicePrices?.[0];
      return { display: String(order.display ?? t('order', 'Order')), service, price };
    });
  }, [orders, billableServices, t]);

  const total = useMemo(() => pricedOrders.reduce((sum, o) => sum + (o.price?.price ?? 0), 0), [pricedOrders]);

  const billableLineItems = useMemo<LocalLineItem[]>(
    () =>
      pricedOrders
        .filter((o) => o.service && o.price)
        .map((o) => ({
          name: o.service!.name,
          price: o.price!.price,
          quantity: 1,
        })),
    [pricedOrders],
  );

  if (!orders || orders.length === 0) {
    return null;
  }

  const patientName = patient?.name?.[0]?.text ?? '';
  const canSend = billableLineItems.length > 0 && !submitting;

  const sendForPayment = async () => {
    setSubmitting(true);
    try {
      createLocalBill({
        patientUuid: patient.id,
        patientName,
        cashierUuid: session?.user?.uuid ?? '',
        requestedByUuid: session?.user?.uuid,
        requestedByName: session?.user?.display,
        lineItems: billableLineItems,
        status: 'PENDING',
      });
      showSnackbar({
        kind: 'success',
        title: t('paymentRequestSent', 'Payment request sent to cashier'),
        subtitle: t('orderProceedsAfterPayment', 'The order can be completed once the patient pays.'),
      });
    } catch (err) {
      showSnackbar({
        kind: 'error',
        title: t('paymentRequestFailed', 'Could not send payment request'),
        subtitle: String((err as Error)?.message ?? ''),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tile className={styles.panel}>
      <div className={styles.panelHeader}>
        <Money size={16} />
        <span>{t('orderPayment', 'Order payment')}</span>
      </div>
      {isLoading ? (
        <InlineLoading description={t('loadingPrices', 'Loading prices…')} />
      ) : (
        <>
          {pricedOrders.map((o, i) => (
            <div className={styles.orderRow} key={i}>
              <span>{o.display}</span>
              {o.price ? (
                <span className={styles.price}>{currencyFmt(o.price.price)}</span>
              ) : (
                <Tag type="warm-gray" size="sm">
                  {t('noPriceSet', 'No price set')}
                </Tag>
              )}
            </div>
          ))}
          <div className={styles.summary}>
            <span>{t('totalPayable', 'Total payable')}</span>
            <span className={styles.price}>{currencyFmt(total)}</span>
          </div>
          <div className={styles.actions}>
            <Button kind="primary" size="sm" renderIcon={Send} disabled={!canSend} onClick={sendForPayment}>
              {submitting ? t('sending', 'Sending…') : t('sendForPayment', 'Send for payment')}
            </Button>
          </div>
        </>
      )}
    </Tile>
  );
}

export default OrderPaymentPanelExtension;
