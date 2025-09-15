import { launchWorkspace, useVisit } from '@openmrs/esm-framework';
import { EmptyState } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ProceduresDetailedSummaryProps {
  patientUuid: string;
  launchStartVisitPrompt: () => void;
}

const ProceduresDetailedSummary: React.FC<ProceduresDetailedSummaryProps> = ({
  patientUuid,
  launchStartVisitPrompt,
}) => {
  const { t } = useTranslation();
  const displayText = t('procedures__lower', 'procedures');
  const headerTitle = t('procedures', 'Procedures');
  const { currentVisit } = useVisit(patientUuid);

  const launchImmunizationsForm = useCallback(() => {
    if (!currentVisit) {
      launchStartVisitPrompt();
      return;
    }
    launchWorkspace('procedures-form-workspace');
  }, [currentVisit, launchStartVisitPrompt]);
  return <EmptyState displayText={displayText} headerTitle={headerTitle} launchForm={launchImmunizationsForm} />;
};

export default ProceduresDetailedSummary;
