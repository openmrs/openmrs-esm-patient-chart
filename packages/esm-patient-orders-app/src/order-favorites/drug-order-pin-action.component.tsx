import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading } from '@carbon/react';
import { Pin, PinFilled } from '@carbon/react/icons';
import { showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import type { Drug } from '@openmrs/esm-patient-common-lib';
import type { ConfigObject } from '../config-schema';
import { isDrugFavorite, getDrugFavorite, extractDrugOrderAttributes } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugOrderSlotState } from './types';
import styles from './drug-order-pin-action.scss';

interface DrugOrderPinActionProps {
  drug: Drug;
  orderItem?: DrugOrderSlotState;
}

const DrugOrderPinAction: React.FC<DrugOrderPinActionProps> = ({ drug, orderItem }) => {
  const { t } = useTranslation();
  const { enableDrugOrderFavorites, maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const { favorites, isLoading, deleteMultipleFavorites } = useFavoritesActions();
  const [isSaving, setIsSaving] = useState(false);

  const isPinned = isDrugFavorite(favorites, drug?.uuid, drug?.concept?.uuid, Boolean(drug?.strength), orderItem);

  const handleClick = useCallback(async () => {
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
  }, [drug, isPinned, favorites, deleteMultipleFavorites, maxPinnedDrugOrders, t, orderItem]);

  if (!drug || !enableDrugOrderFavorites) {
    return null;
  }

  if (isLoading || isSaving) {
    return <InlineLoading className={styles.pinAction} />;
  }

  return (
    <div className={styles.pinAction}>
      {isPinned ? <PinFilled size={16} className={styles.pinIcon} /> : <Pin size={16} className={styles.pinIcon} />}
      <button type="button" className={styles.pinLink} onClick={handleClick}>
        {isPinned
          ? t('removeFromPinnedOrders', 'Remove from my pinned orders')
          : t('addToPinnedOrders', 'Add to my pinned orders')}
      </button>
    </div>
  );
};

export default DrugOrderPinAction;
