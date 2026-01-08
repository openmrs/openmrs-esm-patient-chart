import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useOrderBasket } from '@openmrs/esm-patient-common-lib';
import {
  launchWorkspace,
  translateFrom,
  useLayoutType,
  useSession,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import { careSettingUuid, type LabOrderBasketItem, prepLabOrderPostData, useOrderReasons } from '../api';
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
import { Controller, type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ConfigObject } from '../../config-schema';
import { priorityOptions } from './lab-order';
import { useTestTypes } from './useTestTypes';
import styles from './lab-order-form.scss';

const moduleName = '@openmrs/esm-patient-labs-app';

export interface LabOrderFormProps {
  initialOrder: LabOrderBasketItem;
  closeWorkspace: () => void;
}

const labOrderFormSchema = z.object({
  instructions: z.string().optional(),
  urgency: z.string().refine((value) => value !== '', {
    message: translateFrom(moduleName, 'addLabOrderPriorityRequired', 'Priority is required'),
  }),
  labReferenceNumber: z.string().refine((value) => value !== '', {
    message: translateFrom(moduleName, 'addLabOrderLabReferenceRequired', 'Lab reference number is required'),
  }),
  testType: z.object(
    { label: z.string(), conceptUuid: z.string() },
    {
      required_error: translateFrom(moduleName, 'addLabOrderLabTestTypeRequired', 'Test type is required'),
      invalid_type_error: translateFrom(moduleName, 'addLabOrderLabReferenceRequired', 'Test type is required'),
    },
  ),
  orderReason: z.string().optional(),
});

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function LabOrderForm({ initialOrder, closeWorkspace }: LabOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { patient } = usePatient();
  const { orders, setOrders } = useOrderBasket<LabOrderBasketItem>(patient, 'labs', prepLabOrderPostData);
  const { testTypes, isLoading: isLoadingTestTypes, error: errorLoadingTestTypes } = useTestTypes();
  const [showErrorNotification, setShowErrorNotification] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, defaultValues, isDirty },
  } = useForm<LabOrderBasketItem>({
    mode: 'all',
    resolver: zodResolver(labOrderFormSchema),
    defaultValues: {
      instructions: '',
      labReferenceNumber: '',
      ...initialOrder,
    },
  });
  const config = useConfig<ConfigObject>();
  const watchedTestType = watch('testType');
  const labTestsWithOrderReasons = useMemo(
    () => config?.labTestsWithOrderReasons ?? [],
    [config?.labTestsWithOrderReasons],
  );
  const orderReasonUuids = useMemo(() => {
    const conceptUuid = watchedTestType?.conceptUuid || defaultValues?.testType?.conceptUuid;
    if (!conceptUuid) {
      return [];
    }

    return labTestsWithOrderReasons.find((c) => c.labTestUuid === conceptUuid)?.orderReasons ?? [];
  }, [labTestsWithOrderReasons, watchedTestType, defaultValues?.testType?.conceptUuid]);
  const { orderReasons } = useOrderReasons(orderReasonUuids);

  const handleFormSubmission = useCallback(
    (data: LabOrderBasketItem) => {
      data.careSetting = careSettingUuid;
      data.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => order.testType.conceptUuid == defaultValues.testType.conceptUuid);
      const orderIndex = existingOrder ? orders.indexOf(existingOrder) : orders.length;
      newOrders[orderIndex] = data;
      setOrders(newOrders);
      closeWorkspace();
      launchWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, session?.currentProvider?.uuid, defaultValues],
  );

  const cancelOrder = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== defaultValues.testType.conceptUuid));
    closeWorkspace();
    launchWorkspace('order-basket');
  }, [closeWorkspace, orders, setOrders, defaultValues]);

  const onError = (errors: FieldErrors<LabOrderBasketItem>) => {
    if (errors) {
      setShowErrorNotification(true);
    }
  };

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
      <Form className={styles.orderForm} onSubmit={handleSubmit(handleFormSubmission, onError)} id="drugOrderForm">
        <div className={styles.form}>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <Controller
                  name="testType"
                  control={control}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <ComboBox
                      disabled={isLoadingTestTypes}
                      id="testTypeInput"
                      invalid={Boolean(errors.testType?.message)}
                      invalidText={errors.testType?.message}
                      items={testTypes}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem)}
                      placeholder={
                        isLoadingTestTypes ? `${t('loading', 'Loading')}...` : t('testTypePlaceholder', 'Select one')
                      }
                      selectedItem={value}
                      size="lg"
                      titleText={t('testType', 'Test type')}
                    />
                  )}
                />
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
                      invalid={Boolean(errors.labReferenceNumber?.message)}
                      invalidText={errors.labReferenceNumber?.message}
                      labelText={t('labReferenceNumber', 'Lab reference number')}
                      maxLength={150}
                      onChange={onChange}
                      size="lg"
                      value={value}
                    />
                  )}
                />
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
                      id="priorityInput"
                      invalid={Boolean(errors.urgency?.message)}
                      invalidText={errors.urgency?.message}
                      items={priorityOptions}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem?.value || '')}
                      selectedItem={priorityOptions.find((option) => option.value === value) || null}
                      size="lg"
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
                    render={({ field: { onChange, onBlur, value } }) => (
                      <ComboBox
                        size="lg"
                        id="orderReasonInput"
                        titleText={t('orderReason', 'Order reason')}
                        selectedItem={orderReasons.find((reason) => reason.uuid === value) || null}
                        itemToString={(item) => item?.display}
                        items={orderReasons}
                        onBlur={onBlur}
                        onChange={({ selectedItem }) => onChange(selectedItem?.uuid || '')}
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
                      invalid={Boolean(errors.instructions?.message)}
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
                title={t('error', 'Error')}
                subtitle={t('pleaseRequiredFields', 'Please fill all required fields') + '.'}
                onClose={() => setShowErrorNotification(false)}
              />
            </Column>
          )}
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
