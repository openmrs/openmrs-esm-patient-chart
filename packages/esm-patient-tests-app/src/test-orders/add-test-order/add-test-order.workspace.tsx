import React, { type ComponentProps, useCallback, useState } from 'react';
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
  usePatient,
} from '@openmrs/esm-framework';
import {
  type DefaultPatientWorkspaceProps,
  type OrderBasketItem,
  type TestOrderBasketItem,
  launchPatientWorkspace,
  usePatientChartStore,
  useOrderType,
} from '@openmrs/esm-patient-common-lib';
import { LabOrderForm } from './test-order-form.component';
import { TestTypeSearch } from './test-type-search.component';
import styles from './add-test-order.scss';

export interface AddLabOrderWorkspaceAdditionalProps {
  order?: OrderBasketItem;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
}

export interface AddLabOrderWorkspace extends DefaultPatientWorkspaceProps, AddLabOrderWorkspaceAdditionalProps {}

// Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
export default function AddLabOrderWorkspace({
  order: initialOrder,
  orderTypeUuid,
  orderableConceptSets,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddLabOrderWorkspace) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { patientUuid } = usePatientChartStore();
  const { patient, isLoading: isLoadingPatient } = usePatient(patientUuid);
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as TestOrderBasketItem);

  const patientName = patient ? getPatientName(patient) : '';

  const cancelOrder = useCallback(() => {
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [closeWorkspace]);

  return (
    <div className={styles.container}>
      {isTablet && !isLoadingPatient && (
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
            onClick={cancelOrder}
          >
            <span>{t('backToOrderBasket', 'Back to order basket')}</span>
          </Button>
        </div>
      )}
      {currentLabOrder ? (
        <LabOrderForm
          initialOrder={currentLabOrder}
          patientUuid={patientUuid}
          closeWorkspace={closeWorkspace}
          closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges}
          promptBeforeClosing={promptBeforeClosing}
          setTitle={() => {}}
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
  );
}
