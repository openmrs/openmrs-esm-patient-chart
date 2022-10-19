import React from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { usePatientDeceased } from '../deceased/deceased.resource';

const MarkPatientDeceasedOverflowMenuItem = ({ patientUuid }) => {
  const { t } = useTranslation();
  const handleClick = () => launchPatientWorkspace('mark-patient-deceased-workspace-form');
  const { isDead } = usePatientDeceased(patientUuid);

  return (
    !isDead && (
      <OverflowMenuItem
        itemText={t('markDeceased', 'Mark Deceased')}
        onClick={handleClick}
        style={{
          maxWidth: '100vw',
        }}
      />
    )
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
