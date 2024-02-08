import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { useLayoutType, useSession } from '@openmrs/esm-framework';
import { careSettingUuid, type LabOrderBasketItem, prepLabOrderPostData } from '../api';
import {
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Form,
  Layer,
  Grid,
  InlineNotification,
  TextInput,
  FormLabel,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { priorityOptions } from './lab-order';
import { useTestTypes } from './useTestTypes';
import styles from './lab-order-form.scss';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export interface LabOrderFormProps {
  initialOrder: LabOrderBasketItem;
  closeWorkspace: () => void;
}

const labOrderFormSchema = z.object({
  urgency: z.string({ required_error: 'Priority is required', invalid_type_error: 'Priority is required' }),
  instructions: z.string({
    required_error: 'Additional instructions is required',
    invalid_type_error: 'Additional instructions is required',
  }),
  labReferenceNumber: z.string({
    required_error: 'Lab reference number is required',
    invalid_type_error: 'Lab reference number is required',
  }),
  testType: z.object(
    { label: z.string(), conceptUuid: z.string() },
    { required_error: 'Test type is required', invalid_type_error: 'Test type is required' },
  ),
});

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function LabOrderForm({ initialOrder, closeWorkspace }: LabOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<LabOrderBasketItem>('labs', prepLabOrderPostData);
  const { testTypes, isLoading: isLoadingTestTypes, error: errorLoadingTestTypes } = useTestTypes();

  const { control, handleSubmit, getValues, formState } = useForm<LabOrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(labOrderFormSchema),
    defaultValues: {
      ...initialOrder,
    },
  });

  const handleFormSubmission = useCallback(
    (data: LabOrderBasketItem) => {
      data.careSetting = careSettingUuid;
      data.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => order.testType.conceptUuid == data.testType.conceptUuid);
      const orderIndex = existingOrder ? orders.indexOf(existingOrder) : orders.length;
      newOrders[orderIndex] = data;
      setOrders(newOrders);
      closeWorkspace();
      launchPatientWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, session?.currentProvider?.uuid],
  );

  const cancelOrder = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== getValues().testType.conceptUuid));
    closeWorkspace();
    launchPatientWorkspace('order-basket');
  }, [closeWorkspace, orders, setOrders]);

  return (
    <>
      {errorLoadingTestTypes && (
        <InlineNotification
          kind="error"
          lowContrast
          className={styles.inlineNotification}
          title={t('errorLoadingTestTypes', 'Error occured when loading test types')}
          subtitle={t('tryReopeningTheForm', 'Please try launching the form again')}
        />
      )}
      <Form className={styles.orderForm} onSubmit={handleSubmit(handleFormSubmission)} id="drugOrderForm">
        <div>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="testType"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      size="lg"
                      id="testTypeInput"
                      titleText={t('testType', 'Test type')}
                      selectedItem={value}
                      items={testTypes}
                      placeholder={
                        isLoadingTestTypes ? `${t('loading', 'Loading')}...` : t('testTypePlaceholder', 'Select one')
                      }
                      onBlur={onBlur}
                      disabled={isLoadingTestTypes}
                      onChange={({ selectedItem }) => onChange(selectedItem)}
                    />
                  )}
                />
                <FormLabel className={styles.errorLabel}>{formState.errors.testType?.message}</FormLabel>
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="labReferenceNumber"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      id="labReferenceNumberInput"
                      size="lg"
                      labelText={t('labReferenceNumber', 'Lab reference number')}
                      maxLength={150}
                      value={value}
                      onChange={onChange}
                    />
                  )}
                />
                <FormLabel className={styles.errorLabel}>{formState.errors.labReferenceNumber?.message}</FormLabel>
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={8} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="urgency"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      size="lg"
                      id="priorityInput"
                      titleText={t('priority', 'Priority')}
                      selectedItem={priorityOptions.find((option) => option.value === value)}
                      items={priorityOptions}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem?.value || null)}
                    />
                  )}
                />
                <FormLabel className={styles.errorLabel}>{formState.errors.urgency?.message}</FormLabel>
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="instructions"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      id="additionalInstructionsInput"
                      size="lg"
                      labelText={t('additionalInstructions', 'Additional instructions')}
                      value={value}
                      onChange={onChange}
                      onBlur={onBlur}
                      maxLength={150}
                    />
                  )}
                />
                <FormLabel className={styles.errorLabel}>{formState.errors.instructions?.message}</FormLabel>
              </InputWrapper>
            </Column>
          </Grid>
        </div>
        <ButtonSet
          className={classNames(styles.buttonSet, isTablet ? styles.tabletButtonSet : styles.desktopButtonSet)}
        >
          <Button className={styles.button} kind="secondary" onClick={cancelOrder} size="xl">
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} kind="primary" type="submit" size="xl">
            {t('saveOrder', 'Save order')}
          </Button>
        </ButtonSet>
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
