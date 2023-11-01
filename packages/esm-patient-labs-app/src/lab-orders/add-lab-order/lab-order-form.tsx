import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { Button, ButtonSet, Column, ComboBox, Form, Layer, Grid, InlineNotification, TextInput } from '@carbon/react';
import { LabOrderBasketItem, careSettingUuid, prepLabOrderPostData } from '../api';
import { useLayoutType, useSession } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { priorityOptions } from './lab-order';
import { type TestType, useTestTypes } from './useTestTypes';
import styles from './lab-order-form.scss';

export interface LabOrderFormProps {
  initialOrder: LabOrderBasketItem;
  closeWorkspace: () => void;
}

// Designs:
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
//   https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06d286e0aa7b0316db4a
export function LabOrderForm({ initialOrder, closeWorkspace }: LabOrderFormProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<LabOrderBasketItem>('labs', prepLabOrderPostData);
  const [inProgressLabOrder, setInProgressLabOrder] = useState(initialOrder as LabOrderBasketItem);
  const { testTypes, isLoading: isLoadingTestTypes, error: errorLoadingTestTypes } = useTestTypes();

  const handleFormSubmission = useCallback(
    (e: Event) => {
      e.preventDefault();
      inProgressLabOrder.careSetting = careSettingUuid;
      inProgressLabOrder.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find(
        (order) => order.testType.conceptUuid == inProgressLabOrder.testType.conceptUuid,
      );
      const orderIndex = existingOrder ? orders.indexOf(existingOrder) : orders.length;
      newOrders[orderIndex] = inProgressLabOrder;
      setOrders(newOrders);
      closeWorkspace();
      launchPatientWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, session?.currentProvider?.uuid, inProgressLabOrder],
  );

  const cancelOrder = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== inProgressLabOrder.testType.conceptUuid));
    closeWorkspace();
    launchPatientWorkspace('order-basket');
  }, [closeWorkspace, inProgressLabOrder?.testType?.conceptUuid, orders, setOrders]);

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
      <Form className={styles.orderForm} onSubmit={handleFormSubmission} id="drugOrderForm">
        <div>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <ComboBox
                  size="lg"
                  id="testTypeInput"
                  titleText={t('testType', 'Test type')}
                  selectedItem={testTypes.find((t) => t.conceptUuid == inProgressLabOrder?.testType?.conceptUuid)}
                  items={testTypes}
                  itemToString={(item: TestType) => item?.label}
                  placeholder={
                    isLoadingTestTypes ? `${t('loading', 'Loading')}...` : t('testTypePlaceholder', 'Select one')
                  }
                  required
                  disabled={isLoadingTestTypes}
                  onChange={({ selectedItem }: { selectedItem: TestType }) => {
                    setInProgressLabOrder({
                      ...inProgressLabOrder,
                      display: selectedItem?.label,
                      testType: selectedItem,
                    });
                  }}
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <TextInput
                  id="labReferenceNumberInput"
                  size="lg"
                  labelText={t('labReferenceNumber', 'Lab reference number')}
                  maxLength={150}
                  value={inProgressLabOrder.labReferenceNumber}
                  onChange={(e) =>
                    setInProgressLabOrder({
                      ...inProgressLabOrder,
                      labReferenceNumber: e.target.value,
                    })
                  }
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={8} md={8} sm={4}>
              <InputWrapper>
                <ComboBox
                  size="lg"
                  id="priorityInput"
                  titleText={t('priority', 'Priority')}
                  selectedItem={priorityOptions.find((p) => p.value == inProgressLabOrder?.urgency)}
                  items={priorityOptions}
                  itemToString={(item) => item?.label}
                  onChange={({ selectedItem }) =>
                    setInProgressLabOrder({
                      ...inProgressLabOrder,
                      urgency: selectedItem?.value ?? priorityOptions[0],
                    })
                  }
                />
              </InputWrapper>
            </Column>
          </Grid>
          <Grid className={styles.gridRow}>
            <Column lg={16} md={8} sm={4}>
              <InputWrapper>
                <TextInput
                  id="additionalInstructionsInput"
                  size="lg"
                  labelText={t('additionalInstructions', 'Additional instructions')}
                  // placeholder={t('indicationPlaceholder', 'e.g. "Hypertension"')}
                  value={inProgressLabOrder.instructions}
                  onChange={(e) =>
                    setInProgressLabOrder({
                      ...inProgressLabOrder,
                      instructions: e.target.value,
                    })
                  }
                  maxLength={150}
                />
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
          <Button
            className={styles.button}
            kind="primary"
            type="submit"
            size="xl"
            disabled={!inProgressLabOrder.testType}
          >
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
