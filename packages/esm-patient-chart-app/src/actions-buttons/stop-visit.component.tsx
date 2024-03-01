import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showModal, useVisit } from '@openmrs/esm-framework';

interface StopVisitOverflowMenuItemProps {
  patientUuid: string;
}

const StopVisitOverflowMenuItem: React.FC<StopVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { currentVisit, currentVisitIsRetrospective } = useVisit(patientUuid);

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
          title={`${
            !currentVisitIsRetrospective
              ? t('endVisit', 'End visit')
              : t('exitRetrospective', 'Exit retrospective entry')
          }`}
          data-floating-menu-primary-focus
          onClick={openModal}
          style={{
            maxWidth: '100vw',
          }}
        >
          <span className="cds--overflow-menu-options__option-content">
            {!currentVisitIsRetrospective
              ? t('endVisit', 'End visit')
              : t('exitRetrospective', 'Exit retrospective entry')}
          </span>
        </button>
      </li>
    )
  );
};

export default StopVisitOverflowMenuItem;
