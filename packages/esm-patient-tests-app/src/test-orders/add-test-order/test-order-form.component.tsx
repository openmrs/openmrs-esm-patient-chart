import React, { type ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Form,
  Grid,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  TextArea,
  TextInput,
  Toggle,
} from '@carbon/react';
import { Controller, type ControllerRenderProps, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  type OrderUrgency,
  priorityOptions,
  useOrderBasket,
  useOrderType,
  type TestOrderBasketItem,
  postOrder,
  useMutatePatientOrders,
  showOrderSuccessToast,
} from '@openmrs/esm-patient-common-lib';
import {
  ExtensionSlot,
  OpenmrsDatePicker,
  showSnackbar,
  useConfig,
  useLayoutType,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { prepTestOrderPostData, useOrderReasons } from '../api';
import { ordersEqual } from './test-order';
import { type ConfigObject } from '../../config-schema';
import styles from './test-order-form.scss';

export interface LabOrderFormProps {
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  initialOrder: TestOrderBasketItem;
  onCancel: () => void;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid?: string;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
  patient: fhir.Patient;
}

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function LabOrderForm({
  initialOrder,
  orderToEditOrdererUuid,
  closeWorkspace,
  onCancel,
  orderTypeUuid,
  setHasUnsavedChanges,
  patient,
}: LabOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders, clearOrders } = useOrderBasket<TestOrderBasketItem>(
    patient,
    orderTypeUuid,
    prepTestOrderPostData,
  );
  const config = useConfig<ConfigObject>();
  const { orderType } = useOrderType(orderTypeUuid);
  const { mutate: mutateOrders } = useMutatePatientOrders(patient.id);
  const orderReasonRequired = useMemo(
    () =>
      (config.labTestsWithOrderReasons?.find((c) => c.labTestUuid === initialOrder?.testType?.conceptUuid) || {})
        .required,
    [config.labTestsWithOrderReasons, initialOrder?.testType?.conceptUuid],
  );

  const labOrderFormSchema = useMemo(
    () =>
      z
        .object({
          instructions: z.string().nullish(),
          urgency: z.string().refine((value) => value !== '', {
            message: t('priorityRequired', 'Priority is required'),
          }),
          accessionNumber: z.string().nullish(),
          notifyWhenResulted: z.boolean().nullish(),
          testType: z.object(
            { label: z.string(), conceptUuid: z.string() },
            {
              required_error: t('testTypeRequired', 'Test type is required'),
              invalid_type_error: t('testTypeRequired', 'Test type is required'),
            },
          ),
          orderReason: orderReasonRequired
            ? z
                .string({
                  required_error: t('orderReasonRequired', 'Order reason is required'),
                })
                .refine((value) => !!value, t('orderReasonRequired', 'Order reason is required'))
            : z.string().optional(),
          scheduledDate: z.date({}).nullish(),
        })
        .refine((data) => data.urgency !== 'ON_SCHEDULED_DATE' || Boolean(data.scheduledDate), {
          message: t('scheduledDateRequired', 'Scheduled date is required'),
          path: ['scheduledDate'],
        }),
    [orderReasonRequired, t],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, defaultValues, isDirty, isSubmitting },
    setValue,
    watch,
  } = useForm<TestOrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(labOrderFormSchema),
    defaultValues: {
      accessionNumber: null,
      ...initialOrder,
    },
  });

  const urgency = watch('urgency');
  const isScheduledDateRequired = urgency === 'ON_SCHEDULED_DATE';

  const notifyWhenResultedHint = t(
    'notifyWhenResultedHint',
    "Turning this on sends you a notification the moment this order is resulted, even if the value isn't critical.",
  );
  const futureReleaseNote = t('plannedForFutureRelease', 'Planned for a future release.');

  // Summarizes how the currently selected priority is notified, so the clinician can tell whether
  // opting in adds anything on top of what the priority already does.
  const priorityNotificationSummary = useMemo(() => {
    switch (urgency) {
      case 'ROUTINE':
        return t(
          'routinePriorityNotificationSummary',
          'Routine — filed silently to the chart unless the entered value is critical.',
        );
      case 'STAT':
        return t(
          'statPriorityNotificationSummary',
          'Stat — the clinician is actively waiting. A push notification fires the moment results are entered.',
        );
      case 'ON_SCHEDULED_DATE':
        return t(
          'scheduledPriorityNotificationSummary',
          'On scheduled date — the order activates on the scheduled date, then follows routine handling.',
        );
      default:
        return null;
    }
  }, [t, urgency]);

  const orderReasonUuids =
    (config.labTestsWithOrderReasons?.find((c) => c.labTestUuid === defaultValues?.testType?.conceptUuid) || {})
      .orderReasons || [];

  const { orderReasons } = useOrderReasons(orderReasonUuids);

  const filterItemsByName = useCallback((menu) => {
    const inputValue = menu?.inputValue?.toLowerCase();
    const itemDisplay = menu?.item?.display?.toLowerCase();
    if (!inputValue) {
      return true;
    }
    return itemDisplay?.includes(inputValue);
  }, []);

  const saveLabOrderToBasket = useCallback(
    (data: TestOrderBasketItem) => {
      const finalizedOrder: TestOrderBasketItem = {
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
    [orders, setOrders, closeWorkspace, initialOrder],
  );

  const submitLabOrderToServer = useCallback(
    (data: TestOrderBasketItem) => {
      const finalizedOrder: TestOrderBasketItem = {
        ...initialOrder,
        ...data,
      };
      return postOrder(
        prepTestOrderPostData(finalizedOrder, patient.id, finalizedOrder?.encounterUuid, orderToEditOrdererUuid),
      )
        .then(() => {
          clearOrders();
          mutateOrders();

          /* Translation keys used by showOrderSuccessToast:
           * t('ordersCompleted', 'Orders completed')
           * t('orderPlaced', 'Order placed')
           * t('ordersPlaced', 'Orders placed')
           * t('orderUpdated', 'Order updated')
           * t('ordersUpdated', 'Orders updated')
           * t('orderDiscontinued', 'Order discontinued')
           * t('ordersDiscontinued', 'Orders discontinued')
           * t('orderedFor', 'Placed order for')
           * t('updated', 'Updated')
           * t('discontinued', 'Discontinued')
           */
          showOrderSuccessToast('@openmrs/esm-patient-tests-app', [finalizedOrder]);
          closeWorkspace({ discardUnsavedChanges: true });
        })
        .catch((error) => {
          showSnackbar({
            isLowContrast: false,
            kind: 'error',
            title: t('errorSavingLabOrder', 'Error saving lab order'),
            subtitle: error.message,
          });
        });
    },
    [clearOrders, closeWorkspace, initialOrder, mutateOrders, patient.id, orderToEditOrdererUuid, t],
  );

  const onError = (errors: FieldErrors<TestOrderBasketItem>) => {
    console.error('Error in lab order form', errors);
  };

  const handleUpdateUrgency = useCallback(
    (fieldOnChange: ControllerRenderProps['onChange']) => {
      return (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as OrderUrgency;
        if (value !== 'ON_SCHEDULED_DATE') {
          setValue('scheduledDate', null);
        }
        fieldOnChange(e);
      };
    },
    [setValue],
  );

  const handleToggleNotifyWhenResulted = useCallback(
    (fieldOnChange: ControllerRenderProps['onChange']) => {
      return (checked: boolean) => {
        fieldOnChange(checked);
        if (checked) {
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            title: t('notifyWhenResulted', 'Notify when resulted'),
            subtitle: `${notifyWhenResultedHint} ${futureReleaseNote}`,
          });
        }
      };
    },
    [futureReleaseNote, notifyWhenResultedHint, t],
  );

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty, setHasUnsavedChanges]);

  const responsiveSize = isTablet ? 'lg' : 'sm';

  return (
    <Form
      className={styles.orderForm}
      onSubmit={handleSubmit(
        initialOrder?.action === 'REVISE' ? submitLabOrderToServer : saveLabOrderToBasket,
        onError,
      )}
      id="labOrderForm"
    >
      <div className={styles.form}>
        <ExtensionSlot name="top-of-lab-order-form-slot" state={{ order: initialOrder }} />
        <Grid className={styles.gridRow}>
          <Column lg={16} md={8} sm={4}>
            <InputWrapper>
              <label className={styles.testTypeLabel}>{t('testType', 'Test type')}</label>
              <p className={styles.testType}>{initialOrder?.testType?.label}</p>
            </InputWrapper>
          </Column>
        </Grid>
        {config.showReferenceNumberField ? (
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
        ) : null}
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
                    invalid={Boolean(fieldState?.error?.message)}
                    invalidText={fieldState?.error?.message}
                    labelText={t('priority', 'Priority')}
                  >
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} text={option.label} />
                    ))}
                  </Select>
                )}
              />
            </InputWrapper>
          </Column>
        </Grid>
        {config.showNotifyWhenResultedToggle ? (
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="notifyWhenResulted"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Toggle
                      aria-label={t('notifyMeWhenResulted', 'Notify me when resulted')}
                      id="notifyWhenResultedToggle"
                      labelA={t('off', 'Off')}
                      labelB={t('on', 'On')}
                      labelText={t('notifyMeWhenResulted', 'Notify me when resulted')}
                      onToggle={handleToggleNotifyWhenResulted(onChange)}
                      size={isTablet ? 'md' : 'sm'}
                      toggled={Boolean(value)}
                    />
                  )}
                />
                <InlineNotification className={styles.notifyWhenResultedHint} hideCloseButton kind="info" lowContrast>
                  {notifyWhenResultedHint} <span className={styles.futureReleaseNote}>{futureReleaseNote}</span>
                </InlineNotification>
              </InputWrapper>
            </Column>
          </Grid>
        ) : null}
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
        {orderReasons.length > 0 && (
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="orderReason"
                  control={control}
                  render={({ field: { onBlur, onChange } }) => (
                    <ComboBox
                      id="orderReasonInput"
                      invalid={!!errors.orderReason}
                      invalidText={errors.orderReason?.message}
                      items={orderReasons}
                      itemToString={(item) => item?.display}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem?.uuid || '')}
                      selectedItem={null}
                      shouldFilterItem={filterItemsByName}
                      size={responsiveSize}
                      titleText={t('orderReason', 'Order reason')}
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
        {config.showNotifyWhenResultedToggle && priorityNotificationSummary ? (
          <p className={styles.priorityNotificationSummary}>{priorityNotificationSummary}</p>
        ) : null}
      </div>
      <ButtonSet className={classNames(styles.buttonSet, isTablet ? styles.tabletButtonSet : styles.desktopButtonSet)}>
        <Button className={styles.button} kind="secondary" onClick={onCancel} size="xl">
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" size="xl" type="submit" disabled={isSubmitting}>
          {t('saveOrder', 'Save order')}
        </Button>
      </ButtonSet>
    </Form>
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
