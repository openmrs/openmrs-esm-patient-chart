import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useVisit, showModal } from '@openmrs/esm-framework';
interface CancelVisitOverflowMenuItemProps {
  patientUuid: string;
}

const CancelVisitOverflowMenuItem: React.FC<CancelVisitOverflowMenuItemProps> = ({ patientUuid }) => {
  const { t } = useTranslation();

  const { currentVisit } = useVisit(patientUuid);
  const openModal = useCallback(() => {
    const dispose = showModal('cancel-visit-dialog', {
      closeModal: () => dispose(),
      patientUuid,
    });
  }, [patientUuid]);

  return (
    currentVisit && (
      <li className="bx--overflow-menu-options__option">
        <button
          className="bx--overflow-menu-options__btn"
          role="menuitem"
          title={t('cancelVisit', 'Cancel visit')}
          data-floating-menu-primary-focus
          onClick={openModal}
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
