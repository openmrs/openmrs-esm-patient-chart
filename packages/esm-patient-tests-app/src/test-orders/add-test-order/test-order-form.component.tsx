import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  type DefaultPatientWorkspaceProps,
  launchPatientWorkspace,
  useOrderBasket,
  useOrderType,
} from '@openmrs/esm-patient-common-lib';
import { ExtensionSlot, translateFrom, useConfig, useLayoutType, useSession } from '@openmrs/esm-framework';
import { prepTestOrderPostData, useOrderReasons } from '../api';
import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Form,
  Grid,
  InlineNotification,
  Layer,
  TextArea,
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { ordersEqual, priorityOptions } from './test-order';
import { Controller, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { moduleName } from '@openmrs/esm-patient-chart-app/src/constants';
import { type ConfigObject } from '../../config-schema';
import styles from './test-order-form.scss';
import type { TestOrderBasketItem } from '../../types';

export interface LabOrderFormProps extends DefaultPatientWorkspaceProps {
  initialOrder: TestOrderBasketItem;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
}

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function LabOrderForm({
  initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  orderTypeUuid,
  orderableConceptSets,
}: LabOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const isEditing = useMemo(() => initialOrder && initialOrder.action === 'REVISE', [initialOrder]);
  const { orders, setOrders } = useOrderBasket<TestOrderBasketItem>(orderTypeUuid, prepTestOrderPostData);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const config = useConfig<ConfigObject>();
  const { orderType, isLoadingOrderType } = useOrderType(orderTypeUuid);
  const orderReasonRequired = (
    config.labTestsWithOrderReasons?.find((c) => c.labTestUuid === initialOrder?.testType?.conceptUuid) || {}
  ).required;

  const labOrderFormSchema = useMemo(
    () =>
      z.object({
        instructions: z.string().nullish(),
        urgency: z.string().refine((value) => value !== '', {
          message: translateFrom(moduleName, 'addLabOrderPriorityRequired', 'Priority is required'),
        }),
        accessionNumber: z.string().nullish(),
        testType: z.object(
          { label: z.string(), conceptUuid: z.string() },
          {
            required_error: translateFrom(moduleName, 'addLabOrderLabTestTypeRequired', 'Test type is required'),
            invalid_type_error: translateFrom(moduleName, 'addLabOrderLabReferenceRequired', 'Test type is required'),
          },
        ),
        orderReason: orderReasonRequired
          ? z
              .string({
                required_error: translateFrom(
                  moduleName,
                  'addLabOrderLabOrderReasonRequired',
                  'Order reason is required',
                ),
              })
              .refine(
                (value) => !!value,
                translateFrom(moduleName, 'addLabOrderLabOrderReasonRequired', 'Order reason is required'),
              )
          : z.string().optional(),
      }),
    [orderReasonRequired],
  );

  const {
    control,
    handleSubmit,
    formState: { errors, defaultValues, isDirty },
  } = useForm<TestOrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(labOrderFormSchema),
    defaultValues: {
      accessionNumber: null,
      ...initialOrder,
    },
  });

  const orderReasonUuids =
    (config.labTestsWithOrderReasons?.find((c) => c.labTestUuid === defaultValues?.testType?.conceptUuid) || {})
      .orderReasons || [];

  const { orderReasons } = useOrderReasons(orderReasonUuids);

  const filterItemsByName = useCallback((menu) => {
    return menu?.item?.value?.toLowerCase().includes(menu?.inputValue?.toLowerCase());
  }, []);

  const handleFormSubmission = useCallback(
    (data: TestOrderBasketItem) => {
      const finalizedOrder: TestOrderBasketItem = {
        ...initialOrder,
        ...data,
      };
      finalizedOrder.orderer = session.currentProvider.uuid;

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

      closeWorkspaceWithSavedChanges({
        onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
      });
    },
    [orders, setOrders, session?.currentProvider?.uuid, closeWorkspaceWithSavedChanges, initialOrder],
  );

  const cancelOrder = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== defaultValues.testType.conceptUuid));
    closeWorkspace({
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace, orders, setOrders, defaultValues]);

  const onError = (errors: FieldErrors<TestOrderBasketItem>) => {
    if (errors) {
      setShowErrorNotification(true);
    }
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  const responsiveSize = isTablet ? 'lg' : 'sm';

  return (
    <>
      {/* {errorLoadingTestTypes && (
        <InlineNotification
          className={styles.inlineNotification}
          kind="error"
          lowContrast
          subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
          title={t('errorLoadingTestTypes', 'Error occured when loading test types')}
        />
      )} */}

      <Form className={styles.orderForm} onSubmit={handleSubmit(handleFormSubmission, onError)} id="drugOrderForm">
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
          {config.showLabReferenceNumberField ? (
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
                  render={({ field: { onBlur, onChange, value } }) => (
                    <ComboBox
                      id="priorityInput"
                      invalid={!!errors.urgency}
                      invalidText={errors.urgency?.message}
                      items={priorityOptions}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem?.value || '')}
                      selectedItem={priorityOptions.find((option) => option.value === value) || null}
                      shouldFilterItem={filterItemsByName}
                      size={responsiveSize}
                      titleText={t('priority', 'Priority')}
                    />
                  )}
                />
              </InputWrapper>
            </Column>
          </Grid>
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
                        selectedItem={''}
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
                      size={responsiveSize}
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
            <Button className={styles.button} kind="secondary" onClick={cancelOrder} size="xl">
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
