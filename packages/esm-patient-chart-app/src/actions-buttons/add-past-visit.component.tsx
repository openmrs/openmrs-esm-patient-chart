import React from 'react';
import { useTranslation } from 'react-i18next';

interface AddPastVisitOverflowMenuItemProps {}

const AddPastVisitOverflowMenuItem: React.FC<AddPastVisitOverflowMenuItemProps> = () => {
  const { t } = useTranslation();
  const handleClick = React.useCallback(() => {
    window.dispatchEvent(
      new CustomEvent('visit-dialog', {
        detail: {
          type: 'prompt',
          state: { type: 'past' },
        },
      }),
    );
  }, []);

  return (
    <li className="bx--overflow-menu-options__option">
      <button
        className="bx--overflow-menu-options__btn"
        role="menuitem"
        title={t('addPastVisit', 'Add Past Visit')}
        data-floating-menu-primary-focus
        onClick={handleClick}
        style={{
          maxWidth: '100vw',
        }}>
        <span className="bx--overflow-menu-options__option-content">{t('addPastVisit', 'Add Past Visit')}</span>
      </button>
    </li>
  );
};

export default AddPastVisitOverflowMenuItem;
