import React, { type ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSet,
  Column,
  Form,
  Grid,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  TextArea,
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Controller, type ControllerRenderProps, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  priorityOptions,
  type OrderBasketItem,
  type OrderUrgency,
  useOrderBasket,
  useOrderType,
  postOrder,
  useMutatePatientOrders,
} from '@openmrs/esm-patient-common-lib';
import {
  useLayoutType,
  useSession,
  useConfig,
  ExtensionSlot,
  OpenmrsDatePicker,
  type Workspace2DefinitionProps,
  showSnackbar,
} from '@openmrs/esm-framework';
import { ordersEqual, prepOrderPostData } from '../resources';
import { type ConfigObject } from '../../../config-schema';
import styles from './general-order-form.scss';

export interface OrderFormProps {
  initialOrder: OrderBasketItem;
  orderToEditOrdererUuid?: string;
  orderTypeUuid: string;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  patient: fhir.Patient;
}

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function OrderForm({
  patient,
  initialOrder,
  orderToEditOrdererUuid,
  orderTypeUuid,
  closeWorkspace,
  setHasUnsavedChanges,
}: OrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders, clearOrders } = useOrderBasket<OrderBasketItem>(patient, orderTypeUuid, prepOrderPostData);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const { orderType } = useOrderType(orderTypeUuid);
  const config = useConfig<ConfigObject>();
  const { mutate: mutateOrders } = useMutatePatientOrders(patient.id);

  const OrderFormSchema = useMemo(
    () =>
      z
        .object({
          instructions: z.string().nullish(),
          urgency: z.string().refine((value) => value !== '', {
            message: t('priorityRequired', 'Priority is required'),
          }),
          accessionNumber: z.string().nullish(),
          concept: z.object(
            { display: z.string(), uuid: z.string() },
            {
              required_error: t('orderableConceptRequired', 'Orderable concept is required'),
              invalid_type_error: t('orderableConceptRequired', 'Orderable concept is required'),
            },
          ),
          scheduledDate: z.date().nullish(),
        })
        .refine((data) => data.urgency !== 'ON_SCHEDULED_DATE' || data.scheduledDate, {
          message: t('scheduledDateRequired', 'Scheduled date is required'),
          path: ['scheduledDate'],
        }),
    [t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, defaultValues, isDirty },
    setValue,
    watch,
  } = useForm<OrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      ...initialOrder,
    },
  });

  const isScheduledDateRequired = watch('urgency') === 'ON_SCHEDULED_DATE';

  const filterItemsByName = useCallback((menu) => {
    return menu?.item?.value?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  }, []);

  const saveOrderToBasket = useCallback(
    (data: OrderBasketItem) => {
      const finalizedOrder: OrderBasketItem = {
        ...initialOrder,
        ...data,
      };

      const newOrders = [...orders];
      const existingOrder = orders.find((order) => ordersEqual(order, finalizedOrder));

      if (existingOrder) {
        newOrders[orders.indexOf(existingOrder)] = {
          ...finalizedOrder,
          // Incomplete orders should be marked completed on saving the form
          isOrderIncomplete: false,
        };
      } else {
        newOrders.push(finalizedOrder);
      }

      setOrders(newOrders);

      closeWorkspace({ discardUnsavedChanges: true });
    },
    [orders, setOrders, initialOrder, closeWorkspace],
  );

  const submitDrugOrderToServer = useCallback(
    (data: OrderBasketItem) => {
      const finalizedOrder: OrderBasketItem = {
        ...initialOrder,
        ...data,
      };

      postOrder(prepOrderPostData(finalizedOrder, patient.id, finalizedOrder?.encounterUuid, orderToEditOrdererUuid))
        .then(() => {
          clearOrders();
          mutateOrders();
          showSnackbar({
            isLowContrast: false,
            kind: 'success',
            title: t('successSavingDrugOrder', 'Order saved'),
          });
          closeWorkspace({ discardUnsavedChanges: true });
        })
        .catch((error) => {
          showSnackbar({
            isLowContrast: false,
            kind: 'error',
            title: t('errorSavingDrugOrder', 'Error saving order'),
            subtitle: error,
          });
        });
    },
    [clearOrders, closeWorkspace, initialOrder, mutateOrders, patient.id, orderToEditOrdererUuid, t],
  );

  const cancelOrder = useCallback(() => {
    closeWorkspace().then((didClose: boolean) => {
      if (didClose) {
        setOrders(orders.filter((order) => order.concept.uuid !== defaultValues.concept.conceptUuid));
      }
    });
  }, [closeWorkspace, orders, setOrders, defaultValues]);

  const closeModifyOrderWorkspace = useCallback(() => {
    clearOrders();
    closeWorkspace();
  }, [clearOrders, closeWorkspace]);

  const onError = (errors: FieldErrors<OrderBasketItem>) => {
    if (errors) {
      setShowErrorNotification(true);
    }
  };

  const handleUpdateUrgency = (fieldOnChange: ControllerRenderProps['onChange']) => {
    return (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as OrderUrgency;
      if (value !== 'ON_SCHEDULED_DATE') {
        setValue('scheduledDate', null);
      }
      fieldOnChange(e);
    };
  };

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  const responsiveSize = isTablet ? 'lg' : 'sm';

  return (
    <>
      <Form
        className={styles.orderForm}
        onSubmit={handleSubmit(initialOrder?.action == 'REVISE' ? submitDrugOrderToServer : saveOrderToBasket, onError)}
        id="drugOrderForm"
      >
        <div className={styles.form}>
          <ExtensionSlot name="top-of-lab-order-form-slot" state={{ order: initialOrder }} />
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <label className={styles.testTypeLabel}>{t('testType', 'Test type')}</label>
                <p className={styles.testType}>{initialOrder?.concept?.display}</p>
              </InputWrapper>
            </Column>
          </Grid>
          {config.showReferenceNumberField && (
            <Grid className={styles.gridRow}>
              <Column lg={16} md={8} sm={4}>
                <InputWrapper>
                  <Controller
                    name="accessionNumber"
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        id="labReferenceNumberInput"
                        invalid={!!errors.accessionNumber}
                        invalidText={errors.accessionNumber?.message}
                        labelText={t('referenceNumber', 'Reference number', {
                          orderType: orderType?.display,
                        })}
                        maxLength={150}
                        onBlur={onBlur}
                        onChange={onChange}
                        size={responsiveSize}
                        value={value}
                      />
                    )}
                  />
                </InputWrapper>
              </Column>
            </Grid>
          )}
          <Grid className={styles.gridRow}>
            <Column lg={8} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="urgency"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Select
                      id="priorityInput"
                      {...field}
                      onChange={handleUpdateUrgency(field.onChange)}
                      invalid={Boolean(fieldState?.error)}
                      invalidText={fieldState?.error?.message}
                      labelText={t('priority', 'Priority')}
                    >
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} text={option.label} value={option.value} />
                      ))}
                    </Select>
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
          {isScheduledDateRequired && (
            <Grid className={styles.gridRow}>
              <Column lg={8} md={8} sm={4}>
                <InputWrapper>
                  <Controller
                    name="scheduledDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <OpenmrsDatePicker
                        labelText={t('scheduledDate', 'Scheduled date')}
                        id="scheduledDate"
                        {...field}
                        invalid={Boolean(fieldState?.error?.message)}
                        invalidText={fieldState?.error?.message}
                        minDate={new Date()}
                        size={responsiveSize}
                      />
                    )}
                  />
                </InputWrapper>
              </Column>
            </Grid>
          )}
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="instructions"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextArea
                      enableCounter
                      id="additionalInstructionsInput"
                      invalid={!!errors.instructions}
                      invalidText={errors.instructions?.message}
                      labelText={t('additionalInstructions', 'Additional instructions')}
                      maxCount={500}
                      onBlur={onBlur}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
        </div>
        <div>
          {showErrorNotification && (
            <Column className={styles.errorContainer}>
              <InlineNotification
                lowContrast
                onClose={() => setShowErrorNotification(false)}
                subtitle={t('pleaseRequiredFields', 'Please fill all required fields') + '.'}
                title={t('error', 'Error')}
              />
            </Column>
          )}
          <ButtonSet
            className={classNames(styles.buttonSet, isTablet ? styles.tabletButtonSet : styles.desktopButtonSet)}
          >
            <Button
              className={styles.button}
              kind="secondary"
              onClick={initialOrder?.action == 'REVISE' ? closeModifyOrderWorkspace : cancelOrder}
              size="xl"
            >
              {t('discard', 'Discard')}
            </Button>
            <Button className={styles.button} kind="primary" size="xl" type="submit">
              {t('saveOrder', 'Save order')}
            </Button>
          </ButtonSet>
        </div>
      </Form>
    </>
  );
}

function InputWrapper({ children }) {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <Layer level={isTablet ? 1 : 0}>
      <div className={styles.field}>{children}</div>
    </Layer>
  );
}
