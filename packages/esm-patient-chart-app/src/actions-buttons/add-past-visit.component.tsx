import { showModal } from '@openmrs/esm-framework';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();

  const openModal = useCallback(() => {
    const dispose = showModal('start-visit-dialog', {
      closeModal: () => dispose(),
    });
  }, []);

  return (
    <li className="bx--overflow-menu-options__option">
      <button
        className="bx--overflow-menu-options__btn"
        role="menuitem"
        title={t('addPastVisit', 'Add Past Visit')}
        data-floating-menu-primary-focus
        onClick={openModal}
        style={{
          maxWidth: '100vw',
        }}
      >
        <span className="bx--overflow-menu-options__option-content">{t('addPastVisit', 'Add past visit')}</span>
      </button>
    </li>
  );
};

export default AddPastVisitOverflowMenuItem;
