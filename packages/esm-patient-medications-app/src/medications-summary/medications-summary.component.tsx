import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTableSkeleton } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import MedicationsDetailsTable from '../components/medications-details-table.component';
import { usePatientOrders } from '../api/api';
import { ConfigObject } from '../config-schema';

export interface MedicationsSummaryProps {
  patientUuid: string;
}

export default function MedicationsSummary({ patientUuid }: MedicationsSummaryProps) {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const launchOrderBasket = React.useCallback(() => launchPatientWorkspace('order-basket-workspace'), []);

  const {
    data: activeOrders,
    isError: isErrorActiveOrders,
    isLoading: isLoadingActiveOrders,
    isValidating: isValidatingActiveOrders,
  } = usePatientOrders(patientUuid, 'ACTIVE', config.careSettingUuid);
  const {
    data: pastOrders,
    isError: isErrorPastOrders,
    isLoading: isLoadingPastOrders,
    isValidating: isValidatingPastOrders,
  } = usePatientOrders(patientUuid, 'any', config.careSettingUuid);

  return (
    <>
      <div style={{ marginBottom: '1.5rem' }}>
        {(() => {
          const displayText = t('activeMedicationsDisplayText', 'Active medications');
          const headerTitle = t('activeMedicationsHeaderTitle', 'active medications');

          if (isLoadingActiveOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorActiveOrders) return <ErrorState error={isErrorActiveOrders} headerTitle={headerTitle} />;
          if (activeOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingActiveOrders}
                title={t('activeMedicationsTableTitle', 'Active Medications')}
                medications={activeOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={false}
                showAddNewButton={true}
              />
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} />;
        })()}
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        {(() => {
          const displayText = t('pastMedicationsDisplayText', 'Past medications');
          const headerTitle = t('pastMedicationsHeaderTitle', 'past medications');

          if (isLoadingPastOrders) return <DataTableSkeleton role="progressbar" />;
          if (isErrorPastOrders) return <ErrorState error={isErrorPastOrders} headerTitle={headerTitle} />;
          if (pastOrders?.length) {
            return (
              <MedicationsDetailsTable
                isValidating={isValidatingPastOrders}
                title={t('pastMedicationsTableTitle', 'Past Medications')}
                medications={pastOrders}
                showDiscontinueButton={true}
                showModifyButton={true}
                showReorderButton={true}
                showAddNewButton={true}
              />
            );
          }
          return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchOrderBasket} />;
        })()}
      </div>
    </>
  );
}
