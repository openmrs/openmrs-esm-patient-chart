import React, { type ComponentProps, useCallback, useState } from 'react';
import classNames from 'classnames';
import capitalize from 'lodash-es/capitalize';
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
  type LabOrderBasketItem,
  launchPatientWorkspace,
} from '@openmrs/esm-patient-common-lib';
import { LabOrderForm } from './lab-order-form.component';
import { TestTypeSearch } from './test-type-search.component';
import styles from './add-lab-order.scss';

export interface AddLabOrderWorkspaceAdditionalProps {
  order?: OrderBasketItem;
}

export interface AddLabOrderWorkspace extends DefaultPatientWorkspaceProps, AddLabOrderWorkspaceAdditionalProps {}

// Design: https://app.zeplin.io/project/60d5947dd636aebbd63dce4c/screen/640b06c440ee3f7af8747620
export default function AddLabOrderWorkspace({
  order: initialOrder,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
}: AddLabOrderWorkspace) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { patient, isLoading: isLoadingPatient, patientUuid } = usePatient();
  const [currentLabOrder, setCurrentLabOrder] = useState(initialOrder as LabOrderBasketItem);

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
        />
      ) : (
        <TestTypeSearch openLabForm={setCurrentLabOrder} />
      )}
    </div>
  );
}
