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
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useOrderType, type OrderBasketItem, type TestOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type ConfigObject } from '../../config-schema';
import { LabOrderForm } from './test-order-form.component';
import { TestTypeSearch } from './test-type-search.component';
import styles from './add-test-order.scss';

export interface AddLabOrderProps {
  initialOrder?: OrderBasketItem;

  /**
   * This field should only be supplied for an existing order saved to the backend
   */
  orderToEditOrdererUuid: string;
  orderTypeUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

const AddLabOrder: React.FC<AddLabOrderProps> = ({
  patient,
  orderToEditOrdererUuid,
  visitContext,
  initialOrder,
  orderTypeUuid,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as TestOrderBasketItem);
  const { additionalTestOrderTypes, orders } = useConfig<ConfigObject>();
  const { orderType } = useOrderType(orderTypeUuid);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const title = useMemo(() => {
    if (orderType) {
      if (initialOrder?.action == 'REVISE') {
        return t(`editOrderableForOrderType`, 'Edit {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      } else {
        return t(`addOrderableForOrderType`, 'Add {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      }
    } else {
      return '';
    }
  }, [orderType, t, initialOrder?.action]);

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
              iconDescription={t('back', 'Back')}
              size="sm"
              onClick={() => closeWorkspace()}
            >
              <span>{t('back', 'Back')}</span>
            </Button>
          </div>
        )}
        {currentLabOrder ? (
          <LabOrderForm
            initialOrder={currentLabOrder}
            orderToEditOrdererUuid={orderToEditOrdererUuid}
            closeWorkspace={closeWorkspace}
            setHasUnsavedChanges={setHasUnsavedChanges}
            orderTypeUuid={orderTypeUuid}
            orderableConceptSets={orderableConceptSets}
            patient={patient}
          />
        ) : (
          <TestTypeSearch
            orderTypeUuid={orderTypeUuid}
            orderableConceptSets={orderableConceptSets}
            openLabForm={setCurrentLabOrder}
            closeWorkspace={closeWorkspace}
            patient={patient}
            visit={visitContext}
          />
        )}
      </div>
    </Workspace2>
  );
};

export default AddLabOrder;
