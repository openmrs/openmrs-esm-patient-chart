import React, { useCallback } from 'react';
import { OverflowMenuItem } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const MarkPatientDeceasedOverflowMenuItem = () => {
  const { t } = useTranslation();
  const handleClick = launchPatientWorkspace('mark-patient-deceased-workspace-form');

  return (
    <>
      <OverflowMenuItem
        itemText={t('markDeceased', 'Mark Deceased')}
        onClick={handleClick}
        style={{
          maxWidth: '100vw',
        }}
      />
    </>
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
