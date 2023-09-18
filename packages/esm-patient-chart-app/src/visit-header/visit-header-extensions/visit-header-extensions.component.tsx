import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { useSystemVisitSetting } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';

interface VisitHeaderExtensionsProps {}

const VisitHeaderExtensions: React.FC<VisitHeaderExtensionsProps> = () => {
  const { systemVisitEnabled } = useSystemVisitSetting();
  const { t } = useTranslation();

  return (
    <>
      {systemVisitEnabled && (
        <>
          <ExtensionSlot name="visit-header-right-slot" />
        </>
      )}
    </>
  );
};

export default VisitHeaderExtensions;
