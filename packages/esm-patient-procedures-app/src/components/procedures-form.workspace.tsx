import { useSession, useLayoutType, useVisit } from '@openmrs/esm-framework';
import { type DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ProceduresForm: React.FC<DefaultPatientWorkspaceProps> = ({ patientUuid }) => {
  const currentUser = useSession();
  const isTablet = useLayoutType() === 'tablet';
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);

  return <div>TEST</div>;
};

export default ProceduresForm;
