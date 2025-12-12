import { ExtensionSlot, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import styles from './visit-actions-cell.scss';

interface Props {
  visit: Visit;
  patient: fhir.Patient;
}

const VisitActionsCell: React.FC<Props> = ({ visit, patient }) => {
  return (
    <ExtensionSlot
      name="visit-detail-overview-actions"
      className={styles.visitActions}
      state={{ patientUuid: visit.patient.uuid, patient, visit, compact: true }}
    />
  );
};

export default VisitActionsCell;
