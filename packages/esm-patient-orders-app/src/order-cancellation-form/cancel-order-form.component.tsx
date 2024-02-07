import React, { useCallback, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  TextArea,
  ButtonSet,
  Column,
  Form,
  InlineNotification,
  Stack,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import { showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { usePatientOrders, type Order } from '@openmrs/esm-patient-common-lib';
import styles from './cancel-order-form.scss';
import { saveCancelOrderRequest } from './cancel-order.resource';
import dayjs from 'dayjs';

interface OrderCancellationFormProps {
  order: Order;
  patientUuid: string;
  context?: string;
  closeWorkspace: () => void;
}

const OrderCancellationForm: React.FC<OrderCancellationFormProps> = ({ order, patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const { mutate } = usePatientOrders(patientUuid, 'ACTIVE');

  const cancelOrderSchema = useMemo(() => {
    return z.object({
      cancellationDate: z.date(),
      reasonForCancellation: z.string(),
    });
  }, []);

  type CancelOrderFormData = z.infer<typeof cancelOrderSchema>;

  const { control, handleSubmit, watch, setValue } = useForm<CancelOrderFormData>({
    mode: 'all',
    resolver: zodResolver(cancelOrderSchema),
  });

  function onError(err) {
    if (err?.oneFieldRequired) {
      setShowErrorNotification(true);
    }
  }

  const cancelOrderRequest = useCallback((data: CancelOrderFormData) => {
    const formData = data;
    setShowErrorNotification(false);
    setIsSubmitting(true);

    const payload = {
      fulfillerStatus: 'DECLINED',
      fulfillerComment: formData.reasonForCancellation,
    };

    const abortController = new AbortController();

    saveCancelOrderRequest(order, payload, abortController).then(
      (res) => {
        setIsSubmitting(false);
        closeWorkspace();
        mutate();

        showSnackbar({
          isLowContrast: true,
          title: t('cancelOrder', 'Cancel Order'),
          kind: 'success',
          subtitle: t(
            'successfullyCancelledOrder',
            'You have successfully cancelled an order with OrderNumber {{orderNumber}}',
            { orderNumber: order.orderNumber },
          ),
        });
      },
      (err) => {
        setIsSubmitting(false);
        showSnackbar({
          isLowContrast: true,
          title: t(`errorCancellingOrder', 'Error cancelling order`),
          kind: 'error',
          subtitle: err?.message,
        });
      },
    );
  }, []);

  return (
    <Form className={styles.form}>
      <div className={styles.grid}>
        <Stack>
          <section>
            <h4 style={{ marginBottom: '1rem' }}>{order.display}</h4>
          </section>
          <section>
            <Controller
              name="cancellationDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.row}>
                  <DatePicker
                    id="vaccinationExpiration"
                    className="vaccinationExpiration"
                    minDate={dayjs().startOf('day').format('DD/MM/YYYY')}
                    dateFormat="d/m/Y"
                    datePickerType="single"
                    value={value}
                    onChange={([date]) => onChange(date)}
                    autocomplete="off"
                  >
                    <DatePickerInput
                      id="date-picker-calendar-id"
                      placeholder="dd/mm/yyyy"
                      labelText={t('cancellationDate', 'Cancellation date')}
                      type="text"
                    />
                  </DatePicker>
                </div>
              )}
            />
          </section>
          <section>
            <Controller
              name="reasonForCancellation"
              control={control}
              render={({ field: { onChange, value } }) => (
                <div className={styles.row}>
                  <TextArea
                    type="text"
                    id="reasonForCancellation"
                    labelText={t('reasonForCancellation', 'Reason for cancellation')}
                    value={value}
                    onChange={(evt) => onChange(evt.target.value)}
                  />
                </div>
              )}
            />
          </section>
        </Stack>
      </div>

      {showErrorNotification && (
        <Column className={styles.errorContainer}>
          <InlineNotification
            lowContrast
            title={t('error', 'Error')}
            subtitle={t('pleaseFillField', 'Please fill at least one field') + '.'}
            onClose={() => setShowErrorNotification(false)}
          />
        </Column>
      )}

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
          {t('discard', 'Discard')}
        </Button>
        <Button
          className={styles.button}
          kind="primary"
          onClick={handleSubmit(cancelOrderRequest, onError)}
          disabled={isSubmitting}
          type="submit"
        >
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default OrderCancellationForm;
