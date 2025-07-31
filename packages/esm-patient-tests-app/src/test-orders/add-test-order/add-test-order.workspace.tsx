import React, { type ComponentProps, useMemo, useState } from 'react';
import classNames from 'classnames';
import { capitalize } from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import {
  age,
  ArrowLeftIcon,
  getPatientName,
  formatDate,
  parseDate,
  useLayoutType,
  useConfig,
  Workspace2,
} from '@openmrs/esm-framework';
import {
  type OrderBasketItem,
  PatientWorkspace2DefinitionProps,
  useOrderType,
} from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../../config-schema';
import type { TestOrderBasketItem } from '../../types';
import { LabOrderForm } from './test-order-form.component';
import { TestTypeSearch } from './test-type-search.component';
import styles from './add-test-order.scss';

export interface AddLabOrderWorkspaceAdditionalProps {
  order?: OrderBasketItem;
  orderTypeUuid: string;
}

// Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
export default function AddLabOrderWorkspace({
  groupProps: { patient },
  workspaceProps: {order: initialOrder, orderTypeUuid, },
  closeWorkspace,
}: PatientWorkspace2DefinitionProps<AddLabOrderWorkspaceAdditionalProps, {}>) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as TestOrderBasketItem);
  const { additionalTestOrderTypes, orders } = useConfig<ConfigObject>();
  const { orderType } = useOrderType(orderTypeUuid);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const title = useMemo(() => {
    if (orderType) {
      t(`addOrderableForOrderType`, 'Add {{orderTypeDisplay}}', {
        orderTypeDisplay: orderType.display.toLocaleLowerCase(),
      });
    } else {
      return "";
    }
  }, [orderType, t]);

  const orderableConceptSets = useMemo(() => {
    const allOrderTypes: ConfigObject['additionalTestOrderTypes'] = [
      {
        label: t('labOrders', 'Lab orders'),
        orderTypeUuid: orders.labOrderTypeUuid,
        orderableConceptSets: orders.labOrderableConcepts,
      },
      ...additionalTestOrderTypes,
    ];
    return allOrderTypes.find((orderType) => orderType.orderTypeUuid === orderTypeUuid).orderableConceptSets;
  }, [additionalTestOrderTypes, orderTypeUuid, orders.labOrderTypeUuid, orders.labOrderableConcepts, t]);

  const patientName = patient ? getPatientName(patient) : '';

  return (
    <Workspace2 title={title} hasUnsavedChanges={hasUnsavedChanges}>
      <div className={styles.container}>
      {isTablet && (
        <div className={styles.patientHeader}>
          <span className={styles.bodyShort02}>{patientName}</span>
          <span className={classNames(styles.text02, styles.bodyShort01)}>
            {capitalize(patient?.gender)} &middot; {age(patient?.birthDate)} &middot;{' '}
            <span>{formatDate(parseDate(patient?.birthDate), { mode: 'wide', time: false })}</span>
          </span>
        </div>
      )}
      {!isTablet && (
        <div className={styles.backButton}>
          <Button
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
            iconDescription="Return to order basket"
            size="sm"
            onClick={() => closeWorkspace()}
          >
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
      {currentLabOrder ? (
        <LabOrderForm
          initialOrder={currentLabOrder}
          closeWorkspace={closeWorkspace}
          setHasUnsavedChanges={setHasUnsavedChanges}
          orderTypeUuid={orderTypeUuid}
          orderableConceptSets={orderableConceptSets}
        />
      ) : (
        <TestTypeSearch
          orderTypeUuid={orderTypeUuid}
          orderableConceptSets={orderableConceptSets}
          openLabForm={setCurrentLabOrder}
        />
      )}
    </div>
    </Workspace2>
  );
}
