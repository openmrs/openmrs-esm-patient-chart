import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { OverflowMenuItem } from '@carbon/react';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import styles from './action-button.scss';
import { type VisitFormProps } from '../visit/visit-form/visit-form.workspace';
import { type PatientWorkspaceGroupProps } from '@openmrs/esm-patient-common-lib';

interface StartVisitOverflowMenuItemProps {
  patient: fhir.Patient;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patient }) => {
  const { t } = useTranslation();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  const handleLaunchModal = useCallback(
    () =>
      launchWorkspace2<VisitFormProps, {}, PatientWorkspaceGroupProps>(
        'start-visit-workspace-form',
        { openedFrom: 'patient-chart-start-visit' },
        {},
        { patient, patientUuid: patient.id, visitContext: null, mutateVisitContext: null },
      ),
    [patient],
  );

  return (
    !isDeceased && (
      <OverflowMenuItem className={styles.menuitem} itemText={t('addVisit', 'Add visit')} onClick={handleLaunchModal} />
    )
  );
};

export default StartVisitOverflowMenuItem;
