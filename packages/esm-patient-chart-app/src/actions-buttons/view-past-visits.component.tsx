import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

  const openModal = useCallback(() => {
    launchPatientWorkspace('past-visits-overview');
  }, [patientUuid, launchPatientChart]);

  return (
    <li className="cds--overflow-menu-options__option">
      <button
        className="cds--overflow-menu-options__btn"
        role="menuitem"
        title={t('viewPastVisits', 'View past visits')}
        data-floating-menu-primary-focus
        onClick={openModal}
        style={{
          maxWidth: '100vw',
        }}
      >
        <span className="cds--overflow-menu-options__option-content">{t('viewPastVisits', 'View past visits')}</span>
      </button>
    </li>
  );
};

export default AddPastVisitOverflowMenuItem;
