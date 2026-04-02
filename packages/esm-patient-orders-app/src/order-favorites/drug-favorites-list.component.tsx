import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineNotification, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp, PinFilled } from '@carbon/react/icons';
import { useConfig, useLayoutType, type Visit } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import type { DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { getFavoriteKey } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { createDrugFromFavorite, buildBasketItem } from './helpers';
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
  onClick: (favorite: DrugFavoriteOrder) => void;
  onUnpin: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
}

const FavoriteListItem: React.FC<FavoriteListItemProps> = React.memo(({ favorite, isTablet, onClick, onUnpin }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.favoriteItem}>
      <button type="button" className={styles.itemButton} onClick={() => onClick(favorite)}>
        <div className={styles.itemContent}>
          <p className={styles.itemTitle}>{favorite.displayName}</p>
          {favorite.attributes.strength && <p className={styles.itemDetails}>{favorite.attributes.strength}</p>}
        </div>
      </button>
      <IconButton
        kind="ghost"
        size={isTablet ? 'md' : 'sm'}
        label={t('unpinOrder', 'Unpin order')}
        align="left"
        className={styles.pinButton}
        onClick={(e: React.MouseEvent) => onUnpin(e, favorite)}
      >
        <PinFilled className={styles.pinIcon} />
      </IconButton>
    </div>
  );
});

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
      const drug = createDrugFromFavorite(favorite);
      openOrderForm(buildBasketItem(drug, visit, daysDurationUnit));
    },
    [openOrderForm, visit, daysDurationUnit],
  );

  const handleUnpin = useCallback(
    (e: React.MouseEvent, favorite: DrugFavoriteOrder) => {
      e.stopPropagation();
      deleteMultipleFavorites([favorite]);
    },
    [deleteMultipleFavorites],
  );

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
        <IconButton
          kind="ghost"
          size="sm"
          align="left"
          label={
            isCollapsed
              ? t('expandPinnedOrders', 'Expand pinned orders')
              : t('collapsePinnedOrders', 'Collapse pinned orders')
          }
          onClick={toggleCollapsed}
        >
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </IconButton>
      </div>
      {!isCollapsed && (
        <div className={styles.listContainer}>
          {favorites.map((favorite) => (
            <FavoriteListItem
              key={getFavoriteKey(favorite)}
              favorite={favorite}
              isTablet={isTablet}
              onClick={handleFavoriteClick}
              onUnpin={handleUnpin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DrugFavoritesListExtension;
