import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { usePatient, useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface StartVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { patient } = usePatient(patientUuid);
  const handleClick = useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);

  const isDeceased = Boolean(patient?.deceasedDateTime);

  return (
    !currentVisit &&
    !isDeceased && (
      <li className="cds--overflow-menu-options__option">
        <button
          className="cds--overflow-menu-options__btn"
          role="menuitem"
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: '100vw',
          }}
        >
          <span className="cds--overflow-menu-options__option-content">{t('startVisit', 'Start visit')}</span>
        </button>
      </li>
    )
  );
};

export default StartVisitOverflowMenuItem;
