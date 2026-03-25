import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { isDrugFavorite, getDrugFavorite, extractDrugOrderAttributes } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugActionsMenuProps } from './types';

const DrugActionsMenu: React.FC<DrugActionsMenuProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { enableDrugOrderFavorites, maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, isLoading, deleteMultipleFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const isPinned = isDrugFavorite(favorites, drug?.uuid, drug?.concept?.uuid, Boolean(drug?.strength), orderItem);

  const handlePinClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!drug?.uuid) return;

      if (isPinned) {
        const favorite = getDrugFavorite(favorites, drug.uuid, drug.concept?.uuid, orderItem);
        if (favorite) {
          setIsSaving(true);
          await deleteMultipleFavorites([favorite]);
          setIsSaving(false);
        }
      } else {
        if (favorites.length >= maxPinnedDrugOrders) {
          showSnackbar({
            isLowContrast: false,
            kind: 'warning',
            title: t('maxPinnedOrdersReached', 'Maximum pinned orders reached'),
            subtitle: t('maxPinnedOrdersSubtitle', 'You can have a maximum of {{max}} pinned drug orders', {
              max: maxPinnedDrugOrders,
            }),
          });
          return;
        }
        const dispose = showModal(MODAL_NAMES.DRUG_FAVORITES, {
          closeModal: () => dispose(),
          drug,
          initialAttributes: extractDrugOrderAttributes(drug, orderItem),
        });
      }
    },
    [drug, isPinned, favorites, deleteMultipleFavorites, maxPinnedDrugOrders, t, orderItem],
  );

  if (!drug || !enableDrugOrderFavorites) {
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
      onClick={handlePinClick}
    >
      {isPinned ? <PinFilled /> : <Pin />}
    </IconButton>
  );
};

export default DrugActionsMenu;
