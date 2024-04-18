import React, { useCallback } from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchWorkspace } from '@openmrs/esm-framework';
import { usePatientDeceased } from '../deceased/deceased.resource';

const MarkPatientDeceasedOverflowMenuItem = ({ patientUuid }) => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => launchWorkspace('mark-patient-deceased-workspace-form'), []);
  const { isDead, isLoading: isPatientLoading } = usePatientDeceased(patientUuid);

  return (
    !isPatientLoading &&
    !isDead && (
      <OverflowMenuItem
        itemText={t('markDeceased', 'Mark deceased')}
        onClick={handleClick}
        style={{
          maxWidth: '100vw',
        }}
      />
    )
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
