import React, { useCallback } from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { usePatientDeceased } from '../deceased/deceased.resource';

interface MarkPatientAliveOverflowMenuItemProps {
  patientUuid?: string;
  launchPatientChart?: boolean;
}

const MarkPatientAliveOverflowMenuItem: React.FC<MarkPatientAliveOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { isDead } = usePatientDeceased(patientUuid);

  const openModal = useCallback(() => {
    const dispose = showModal('confirm-alive-modal', {
      patientUuid,
      closeDialog: () => dispose(),
    });
  }, [patientUuid]);

  return (
    isDead && (
      <OverflowMenuItem
        itemText={t('markAlive', 'Mark Alive')}
        onClick={openModal}
        style={{
          maxWidth: '100vw',
        }}
      />
    )
  );
};

export default MarkPatientAliveOverflowMenuItem;
