import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import { isDrugFavorite, getDrugFavorite, extractDrugOrderAttributes } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugPinButtonProps } from './types';
import styles from './drug-pin-button.scss';

const DrugPinButton: React.FC<DrugPinButtonProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
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
        const attributes = extractDrugOrderAttributes(drug, orderItem);
        const dispose = showModal(MODAL_NAMES.DRUG_FAVORITES, {
          closeModal: () => dispose(),
          drug,
          strength: attributes.strength,
          dose: attributes.dose,
          unit: attributes.unit,
          unitUuid: attributes.unitUuid,
          route: attributes.route,
          routeUuid: attributes.routeUuid,
          frequency: attributes.frequency,
          frequencyUuid: attributes.frequencyUuid,
        });
      }
    },
    [drug, isPinned, favorites, deleteMultipleFavorites, maxPinnedDrugOrders, t, orderItem],
  );

  if (!drug || !enableDrugOrderFavorites) {
    return null;
  }

  return (
    <IconButton
      className={styles.pinButton}
      kind="ghost"
      size="sm"
      label={isPinned ? t('unpinOrder', 'Unpin order') : t('pinOrder', 'Pin order')}
      onClick={handlePinClick}
      disabled={isLoading}
    >
      {isLoading ? <InlineLoading /> : isPinned ? <PinFilled /> : <Pin />}
    </IconButton>
  );
};

export default DrugPinButton;
