import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface AddPastVisitOverflowMenuItemProps {
  patientUuid?: string;
  launchPatientChart?: boolean;
}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = ({
  patientUuid,
  launchPatientChart,
}) => {
  const { t } = useTranslation();

  const openVisitForm = useCallback(() => {
    launchPatientWorkspace('start-visit-workspace-form', {
      isCreatingVisit: true,
      workspaceTitle: t('addPastVisit', 'Add past visit'),
    });
  }, [patientUuid, launchPatientChart]);

  return (
    <li className="cds--overflow-menu-options__option">
      <button
        className="cds--overflow-menu-options__btn"
        role="menuitem"
        title={t('addPastVisit', 'Add past visit')}
        data-floating-menu-primary-focus
        onClick={openVisitForm}
        style={{
          maxWidth: '100vw',
        }}
      >
        <span className="cds--overflow-menu-options__option-content">{t('addPastVisit', 'Add past visit')}</span>
      </button>
    </li>
  );
};

export default AddPastVisitOverflowMenuItem;
