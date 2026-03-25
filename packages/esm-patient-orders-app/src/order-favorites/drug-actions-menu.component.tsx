import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { usePinToggle } from './usePinToggle';
import type { DrugActionsMenuProps } from './types';

const DrugActionsMenu: React.FC<DrugActionsMenuProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { isPinned, isSaving, isLoading, isEnabled, toggle } = usePinToggle(drug, orderItem);

  if (!isEnabled) {
    return null;
  }

  if (isSaving || isLoading) {
    return <InlineLoading />;
  }

  return (
    <IconButton
      kind="ghost"
      size={isTablet ? 'md' : 'sm'}
      label={isPinned ? t('unpinOrder', 'Unpin order') : t('pinOrder', 'Pin order')}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        toggle();
      }}
    >
      {isPinned ? <PinFilled /> : <Pin />}
    </IconButton>
  );
};

export default DrugActionsMenu;
