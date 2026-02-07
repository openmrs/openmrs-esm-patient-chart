import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { showModal } from '@openmrs/esm-framework';
import { isDrugFavorite, removeDrugFavorite, extractDrugOrderAttributes } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugPinButtonProps } from './types';
import styles from './drug-pin-button.scss';

const DrugPinButton: React.FC<DrugPinButtonProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
  const { favorites, persistFavorites } = useFavoritesActions();
  const [isLoading, setIsLoading] = useState(false);

  const isPinned = isDrugFavorite(favorites, drug?.uuid, drug?.concept?.uuid, Boolean(drug?.strength));

  const handlePinClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!drug?.uuid) return;

      if (isPinned) {
        setIsLoading(true);
        const updatedFavorites = removeDrugFavorite(favorites, drug.uuid, drug.concept?.uuid);
        await persistFavorites(updatedFavorites, {
          successTitle: t('orderUnpinned', 'Order unpinned'),
          successSubtitle: t('orderUnpinnedSubtitle', '{{drugName}} has been removed from your pinned orders', {
            drugName: drug.display,
          }),
          errorTitle: t('errorUnpinningOrder', 'Error unpinning order'),
        });
        setIsLoading(false);
      } else {
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
    [drug, isPinned, favorites, persistFavorites, t, orderItem],
  );

  if (!drug) {
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
