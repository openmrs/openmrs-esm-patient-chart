import { ExtensionSlot, type Visit } from '@openmrs/esm-framework';
import React from 'react';
import styles from './visit-actions-cell.scss';

interface Props {
  visit: Visit;
}

const VisitActionsCell: React.FC<Props> = ({ visit }) => {
  return (
    <ExtensionSlot
      name="visit-detail-overview-actions"
      className={styles.visitActions}
      state={{ patientUuid: visit.patient.uuid, visit, compact: true }}
    />
  );
};

export default VisitActionsCell;
