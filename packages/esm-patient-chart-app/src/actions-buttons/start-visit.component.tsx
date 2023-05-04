import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, usePatient, useVisit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface StartVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StartVisitOverflowMenuItem: React.FC<StartVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { patient } = usePatient(patientUuid);
  const handleClick = React.useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);
  const { startVisitLabel } = useConfig();
  
  const isDeceased = Boolean(patient?.deceasedDateTime);
  const deceased = (!isDeceased && currentVisit);

  return (
    deceased && (
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
          <span className="cds--overflow-menu-options__option-content">
            {!startVisitLabel ? <>{t('startVisit', 'Start visit')}</> : startVisitLabel}
          </span>
        </button>
      </li>
    )
  );
};

export default StartVisitOverflowMenuItem;
