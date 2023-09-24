import React, { useCallback, useState } from 'react';
import capitalize from 'lodash-es/capitalize';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Column, ComboBox, Form, Layer, Grid, TextInput, InlineNotification } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { age, formatDate, parseDate, useLayoutType, usePatient, useSession } from '@openmrs/esm-framework';
import {
  DefaultWorkspaceProps,
  launchPatientWorkspace,
  OrderBasketItem,
  useOrderBasket,
} from '@openmrs/esm-patient-common-lib';
import { LabOrderBasketItem, careSettingUuid, prepLabOrderPostData } from '../api';
import styles from './add-lab-order.scss';
import { TestType, useTestTypes } from './useTestTypes';

// See the Urgency enum in https://github.com/openmrs/openmrs-core/blob/492dcd35b85d48730bd19da48f6db146cc882c22/api/src/main/java/org/openmrs/Order.java
const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
];
// TODO add priority option `{ value: "ON_SCHEDULED_DATE", label: "On scheduled date" }` once the form supports a date.

const emptyLabOrder: LabOrderBasketItem = {
  action: 'NEW',
  urgency: priorityOptions[0].value,
  display: null,
};

export interface AddLabOrderWorkspaceAdditionalProps {
  order: OrderBasketItem;
}

export interface AddLabOrderWorkspace extends DefaultWorkspaceProps, AddLabOrderWorkspaceAdditionalProps {}

// Design: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/62c6bf3e8e5a4119570c1bae
export default function AddLabOrderWorkspace({ order: initialOrder, closeWorkspace }: AddLabOrderWorkspace) {
  const { t } = useTranslation();
  const session = useSession();
  const { patient, isLoading: isLoadingPatient } = usePatient();
  const { orders, setOrders } = useOrderBasket('labs', prepLabOrderPostData);
  const [inProgressLabOrder, setInProgressLabOrder] = useState((initialOrder ?? emptyLabOrder) as LabOrderBasketItem);
  const { testTypes, isLoading: isLoadingTestTypes, error: errorLoadingTestTypes } = useTestTypes();
  const isTablet = useLayoutType() === 'tablet';

  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  const cancelOrder = useCallback(() => {
    closeWorkspace();
    launchPatientWorkspace('order-basket');
  }, [closeWorkspace]);

  const handleFormSubmission = useCallback(
    (e: Event) => {
      e.preventDefault();
      inProgressLabOrder.careSetting = careSettingUuid;
      inProgressLabOrder.orderer = session.currentProvider.uuid;
      const newOrders = [...orders];
      const existingOrder = orders.find((order) => ordersEqual(order, inProgressLabOrder));
      const orderIndex = existingOrder ? orders.indexOf(existingOrder) : orders.length;
      newOrders[orderIndex] = inProgressLabOrder;
      setOrders(newOrders);
      closeWorkspace();
      launchPatientWorkspace('order-basket');
    },
    [orders, setOrders, closeWorkspace, session.currentProvider.uuid, inProgressLabOrder],
  );

  return (
    <>
      {isTablet && !isLoadingPatient && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={`${styles.text02} ${styles.bodyShort01}`}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </span>
        </div>
      )}
      {!isTablet && (
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props) => <ArrowLeft size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={cancelOrder}
          >
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
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
            <Column lg={8} md={8} sm={4}>
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
            <Column lg={8} md={8} sm={4}>
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
        <ButtonSet className={`${styles.buttonSet} ${isTablet ? styles.tabletButtonSet : styles.desktopButtonSet}`}>
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

function ordersEqual(order1: LabOrderBasketItem, order2: LabOrderBasketItem) {
  return order1.testType.conceptUuid === order2.testType.conceptUuid;
}
