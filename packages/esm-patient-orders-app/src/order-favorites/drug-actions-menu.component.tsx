import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import { usePinToggle } from './usePinToggle';

const DrugActionsMenu: React.FC<{ drug: Drug }> = ({ drug }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { isPinned, isSaving, isLoading, isEnabled, toggle } = usePinToggle(drug);

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
      align="left"
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
