import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface CancelVisitOverflowMenuItemProps {
  patientUuid: string;
}

const CancelVisitOverflowMenuItem: React.FC<CancelVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const handleClick = React.useCallback(
    () =>
      window.dispatchEvent(
        new CustomEvent('visit-dialog', {
          detail: {
            type: 'cancel',
          },
        }),
      ),
    [currentVisit],
  );

  return (
    currentVisit && (
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t('cancelVisit', 'Cancel visit')}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: '100vw',
          }}
        >
          <span className="bx--overflow-menu-options__option-content">{t('cancelVisit', 'Cancel visit')}</span>
        </button>
      </li>
    )
  );
};

export default CancelVisitOverflowMenuItem;
