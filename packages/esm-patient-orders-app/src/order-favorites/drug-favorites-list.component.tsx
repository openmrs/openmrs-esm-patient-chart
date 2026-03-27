import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, SkeletonText, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { ChevronDown, ChevronUp, Pin } from '@carbon/react/icons';
import { showModal, useConfig, useLayoutType, type Visit } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import type { Drug, DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { getFavoriteKey } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import { formatDrugInfo, createDrugFromFavorite, buildBasketItem } from './helpers';
import type { DrugFavoriteOrder } from './types';
import styles from './drug-favorites-list.scss';

interface DrugFavoritesListExtensionProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  isSearching?: boolean;
  visit: Visit;
  daysDurationUnit?: { uuid: string; display: string };
}

interface FavoriteListItemProps {
  favorite: DrugFavoriteOrder;
  isTablet: boolean;
  anyStrengthLabel: string;
  onClick: (favorite: DrugFavoriteOrder) => void;
  onEdit: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
  onDelete: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
}

const FavoriteListItem: React.FC<FavoriteListItemProps> = React.memo(
  ({ favorite, isTablet, anyStrengthLabel, onClick, onEdit, onDelete }) => {
    const { t } = useTranslation();

    return (
      <div className={styles.favoriteItem}>
        <div className={styles.pinButton}>
          <Pin className={styles.pinIcon} />
        </div>
        <button
          type="button"
          className={styles.itemButton}
          onClick={() => onClick(favorite)}
          aria-label={favorite.displayName}
        >
          <div className={styles.itemContent}>
            <p className={styles.itemTitle}>{favorite.displayName}</p>
            <p className={styles.itemDetails}>{formatDrugInfo(favorite, anyStrengthLabel)}</p>
          </div>
        </button>
        <OverflowMenu
          size={isTablet ? 'md' : 'sm'}
          flipped
          aria-label={t('pinnedOrderActions', 'Pinned order actions')}
        >
          <OverflowMenuItem
            className={styles.menuItem}
            itemText={t('edit', 'Edit')}
            onClick={(e: React.MouseEvent) => onEdit(e, favorite)}
          />
          <OverflowMenuItem
            className={styles.menuItem}
            itemText={t('delete', 'Delete')}
            onClick={(e: React.MouseEvent) => onDelete(e, favorite)}
            isDelete
          />
        </OverflowMenu>
      </div>
    );
  },
);

const DrugFavoritesListExtension: React.FC<DrugFavoritesListExtensionProps> = ({
  openOrderForm,
  isSearching = false,
  visit,
  daysDurationUnit,
}) => {
  const { t } = useTranslation();
  const { enableDrugOrderFavorites } = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const { favorites, error, isLoading, deleteMultipleFavorites } = useFavoritesActions();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isSearching);
  }, [isSearching]);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  const handleFavoriteClick = useCallback(
    (favorite: DrugFavoriteOrder) => {
      if (favorite.drugUuid) {
        const drug = createDrugFromFavorite(favorite);
        if (drug) {
          openOrderForm(buildBasketItem(drug, favorite, visit, daysDurationUnit));
        }
        return;
      }

      if (favorite.conceptUuid && favorite.conceptName) {
        const dispose = showModal(MODAL_NAMES.STRENGTH_PICKER, {
          closeModal: () => dispose(),
          conceptUuid: favorite.conceptUuid,
          conceptName: favorite.conceptName,
          onSelectDrug: (selectedDrug: Drug) => {
            openOrderForm(buildBasketItem(selectedDrug, favorite, visit, daysDurationUnit));
          },
        });
      }
    },
    [openOrderForm, visit, daysDurationUnit],
  );

  const handleEditItem = useCallback((e: React.MouseEvent, favorite: DrugFavoriteOrder) => {
    e.stopPropagation();

    const dispose = showModal(MODAL_NAMES.DRUG_FAVORITES, {
      closeModal: () => dispose(),
      existingFavorite: favorite,
    });
  }, []);

  const handleClearAll = useCallback(() => {
    const dispose = showModal(MODAL_NAMES.DELETE_FAVORITES, {
      closeModal: () => dispose(),
      favorites,
    });
  }, [favorites]);

  const handleDelete = useCallback(
    (e: React.MouseEvent, favorite: DrugFavoriteOrder) => {
      e.stopPropagation();
      deleteMultipleFavorites([favorite]);
    },
    [deleteMultipleFavorites],
  );

  const anyStrengthLabel = t('anyStrength', 'Any strength');

  if (!enableDrugOrderFavorites) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <SkeletonText heading width="200px" />
        <div className={styles.skeletonCards}>
          <SkeletonText width="100%" />
          <SkeletonText width="100%" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <InlineNotification
          kind="error"
          lowContrast
          title={t('errorLoadingFavorites', 'Error loading pinned orders')}
          hideCloseButton
        />
      </div>
    );
  }

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>{t('myPinnedDrugOrders', 'My pinned drug orders')}</span>
        <div className={styles.headerActions}>
          {!isCollapsed && (
            <Button kind="danger--ghost" size={isTablet ? 'md' : 'sm'} onClick={handleClearAll}>
              {t('clearAll', 'Clear all')}
            </Button>
          )}
          <button
            type="button"
            className={styles.chevronButton}
            onClick={toggleCollapsed}
            aria-label={
              isCollapsed
                ? t('expandPinnedOrders', 'Expand pinned orders')
                : t('collapsePinnedOrders', 'Collapse pinned orders')
            }
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <div className={styles.listContainer}>
          {favorites.map((favorite) => (
            <FavoriteListItem
              key={getFavoriteKey(favorite)}
              favorite={favorite}
              isTablet={isTablet}
              anyStrengthLabel={anyStrengthLabel}
              onClick={handleFavoriteClick}
              onEdit={handleEditItem}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DrugFavoritesListExtension;
