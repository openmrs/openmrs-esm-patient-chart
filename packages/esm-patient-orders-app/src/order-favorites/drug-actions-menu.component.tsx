import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { showModal, showSnackbar, useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { isDrugFavorite, getDrugFavorite, extractDrugOrderAttributes } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugPinButtonProps } from './types';

const DrugPinButton: React.FC<DrugPinButtonProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { enableDrugOrderFavorites, maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, deleteMultipleFavorites } = useFavoritesActions();
  const [isLoading, setIsLoading] = useState(false);

  const isPinned = isDrugFavorite(favorites, drug?.uuid, drug?.concept?.uuid, Boolean(drug?.strength));

  const handlePinClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!drug?.uuid) return;

      if (isPinned) {
        const favorite = getDrugFavorite(favorites, drug.uuid, drug.concept?.uuid);
        if (favorite) {
          setIsLoading(true);
          await deleteMultipleFavorites([favorite]);
          setIsLoading(false);
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

  if (isLoading) {
    return <InlineLoading />;
  }

  return (
    <OverflowMenu size={isTablet ? 'md' : 'sm'} flipped aria-label={t('drugActions', 'Drug actions')}>
      <OverflowMenuItem
        style={{ maxWidth: 'none' }}
        itemText={isPinned ? t('unpinOrder', 'Unpin order') : t('pinOrder', 'Pin order')}
        onClick={handlePinClick}
      />
    </OverflowMenu>
  );
};

export default DrugPinButton;
