import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useConfig, useVisit } from '@openmrs/esm-framework';

interface StopVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StopVisitOverflowMenuItem: React.FC<StopVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { endVisitLabel } = useConfig();

  const openModal = useCallback(() => {
    const dispose = showModal('end-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    currentVisit && (
      <li className="cds--overflow-menu-options__option">
        <button
          className="cds--overflow-menu-options__btn"
          role="menuitem"
          title={endVisitLabel ? endVisitLabel : `${t('endVisit', 'End visit')}`}
          data-floating-menu-primary-focus
          onClick={openModal}
          style={{
            maxWidth: '100vw',
          }}
        >
          <span className="cds--overflow-menu-options__option-content">
            {endVisitLabel ? endVisitLabel : <>{t('endVisit', 'End visit')}</>}
          </span>
        </button>
      </li>
    )
  );
};

export default StopVisitOverflowMenuItem;
