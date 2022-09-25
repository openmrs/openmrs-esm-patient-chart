import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

const MarkPatientDeceasedOverflowMenuItem = () => {
  const { t } = useTranslation();
  const handleClick = useCallback(() => launchPatientWorkspace('mark-patient-deceased-workspace-form'), []);

  return (
    <>
      <li className="cds--overflow-menu-options__option">
        <button
          className="cds--overflow-menu-options__btn"
          role="menuitem"
          title={t('markDeceased', 'Mark Deceased')}
          data-floating-menu-primary-focus
          onClick={handleClick}
          style={{
            maxWidth: '100vw',
          }}
        >
          <span className="cds--overflow-menu-options__option-content">{t('Mark Deceased')}</span>
        </button>
      </li>
    </>
  );
};

export default MarkPatientDeceasedOverflowMenuItem;
