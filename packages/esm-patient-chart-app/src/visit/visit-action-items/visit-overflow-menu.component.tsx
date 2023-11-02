import React from 'react';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Visit, useLayoutType } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface VisitOverflowMenuProps {
  patientUuid: string;
  visit: Visit;
}

export default function VisitOverflowMenu({ patientUuid, visit }: VisitOverflowMenuProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const editVisitDetails = () => {
    launchPatientWorkspace('start-visit-workspace-form', {
      workspaceTitle: t('editVisitDetails', 'Edit visit details'),
      visitDetails: visit,
    });
  };

  return (
    <OverflowMenu aria-label="visit-action-menu" align="bottom" size={isTablet ? 'lg' : 'sm'}>
      <OverflowMenuItem itemText={t('editVisitDetails', 'Edit visit details')} onClick={editVisitDetails} />
      <OverflowMenuItem hasDivider isDelete itemText={t('deleteVisit', 'Delete visit')} />
    </OverflowMenu>
  );
}
