import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineNotification, SkeletonText, Tag } from '@carbon/react';
import { ChevronDown, ChevronUp, PinFilled } from '@carbon/react/icons';
import { useConfig, useLayoutType, type Visit } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import type { DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { getFavoriteKey } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { useDismissedSuggestions } from './useDismissedSuggestions';
import { findSwapCandidate, type SwapCandidate, useDrugOrderSuggestions } from './drug-suggestions.resource';
import DrugSuggestions from './drug-suggestions.component';
import { createDrugFromFavorite, buildBasketItem, buildFavoriteOrder } from './helpers';
import type { DrugFavoriteOrder } from './types';
import styles from './drug-favorites-list.scss';

interface DrugFavoritesListExtensionProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  isSearching?: boolean;
  visit: Visit;
  daysDurationUnit?: { uuid: string; display: string };
  prescribedDrugUuids?: Set<string>;
  isLoadingOrders?: boolean;
  ordersError?: Error;
}

interface FavoriteListItemProps {
  favorite: DrugFavoriteOrder;
  isTablet: boolean;
  alreadyPrescribed: boolean;
  hasOrdersError: boolean;
  onClick: (favorite: DrugFavoriteOrder) => void;
  onUnpin: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
}

const FavoriteListItem: React.FC<FavoriteListItemProps> = React.memo(
  ({ favorite, isTablet, alreadyPrescribed, hasOrdersError, onClick, onUnpin }) => {
    const { t } = useTranslation();

    return (
      <div className={styles.favoriteItem}>
        <button
          type="button"
          className={styles.itemButton}
          onClick={() => onClick(favorite)}
          disabled={hasOrdersError || alreadyPrescribed}
        >
          <div className={styles.itemContent}>
            <p className={styles.itemTitle}>{favorite.displayName}</p>
            {favorite.attributes.strength && <p className={styles.itemDetails}>{favorite.attributes.strength}</p>}
          </div>
          {alreadyPrescribed && (
            <Tag type="green" size="sm">
              {t('drugAlreadyPrescribed', 'Already prescribed')}
            </Tag>
          )}
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
  },
);

const DrugFavoritesListExtension: React.FC<DrugFavoritesListExtensionProps> = ({
  openOrderForm,
  isSearching = false,
  visit,
  daysDurationUnit,
  prescribedDrugUuids = new Set<string>(),
  isLoadingOrders = false,
  ordersError,
}) => {
  const { t } = useTranslation();
  const { enableDrugOrderFavorites, enableDrugOrderSuggestions, maxPinnedDrugOrders } = useConfig<ConfigObject>();
  const isTablet = useLayoutType() === 'tablet';
  const { favorites, error, isLoading, deleteMultipleFavorites, persistFavorites } = useFavoritesActions();
  const { hiddenOrDismissedDrugUuids, isSwapPromptHidden, hideSuggestion, hideSwapPrompt, dismissSuggestion } =
    useDismissedSuggestions();

  const excludedDrugUuids = useMemo(
    () => new Set([...hiddenOrDismissedDrugUuids, ...favorites.map((favorite) => favorite.drugUuid)]),
    [hiddenOrDismissedDrugUuids, favorites],
  );
  const canSuggest = enableDrugOrderFavorites && enableDrugOrderSuggestions && !isLoading && !error;
  const { suggestions, orderCounts, windowInDays, scannedOrderCount, totalOrderCount } = useDrugOrderSuggestions(
    excludedDrugUuids,
    canSuggest,
  );
  const isPinnedListFull = favorites.length >= maxPinnedDrugOrders;
  // When pins are full, suggestions can't be pinned, so we offer to swap out the least-ordered pin instead
  const visibleSuggestions = canSuggest && !isPinnedListFull ? suggestions : [];
  const swapCandidate =
    canSuggest && isPinnedListFull && !isSwapPromptHidden
      ? findSwapCandidate(favorites, orderCounts, suggestions[0])
      : null;

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isSearching);
  }, [isSearching]);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  const handleFavoriteClick = useCallback(
    (favorite: DrugFavoriteOrder) => {
      if (ordersError || prescribedDrugUuids.has(favorite.drugUuid)) {
        return;
      }
      const drug = createDrugFromFavorite(favorite);
      openOrderForm(buildBasketItem(drug, visit, daysDurationUnit));
    },
    [openOrderForm, visit, daysDurationUnit, prescribedDrugUuids, ordersError],
  );

  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = useCallback(
    async ({ suggestion, favorite }: SwapCandidate) => {
      const newFavorite = buildFavoriteOrder(suggestion.drug);
      setIsSwapping(true);
      await persistFavorites(
        favorites.map((current) => (current.id === favorite.id ? newFavorite : current)),
        {
          successTitle: t('pinnedOrdersSwapped', 'Pinned orders updated'),
          successSubtitle: t('pinnedOrderSwappedSubtitle', '{{added}} replaced {{removed}} in your pinned orders', {
            added: newFavorite.displayName,
            removed: favorite.displayName,
            interpolation: { escapeValue: false },
          }),
          errorTitle: t('errorPinningOrder', 'Error pinning order'),
        },
      );
      setIsSwapping(false);
    },
    [favorites, persistFavorites, t],
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

  const hasFavorites = favorites.length > 0;
  const hasSuggestions = !isSearching && (visibleSuggestions.length > 0 || Boolean(swapCandidate));

  if (!hasFavorites && !hasSuggestions) {
    return null;
  }

  if (isLoadingOrders) {
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

  return (
    <div className={styles.container}>
      {hasFavorites && (
        <div className={styles.header}>
          <span className={styles.headerTitle}>{t('myPinnedDrugOrders', 'My pinned drug orders')}</span>
          {isPinnedListFull && (
            <Tag type="gray" size="sm">
              {t('pinnedOrdersFull', '{{pinned}} / {{max}} full', {
                pinned: favorites.length,
                max: maxPinnedDrugOrders,
              })}
            </Tag>
          )}
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
      )}
      {ordersError && hasFavorites && (
        <InlineNotification
          kind="error"
          lowContrast
          title={t('errorLoadingMedicationOrders', 'Error loading medication orders')}
          hideCloseButton
        />
      )}
      {!isCollapsed && hasFavorites && (
        <div className={styles.listContainer}>
          {favorites.map((favorite) => (
            <FavoriteListItem
              key={getFavoriteKey(favorite)}
              favorite={favorite}
              isTablet={isTablet}
              alreadyPrescribed={prescribedDrugUuids.has(favorite.drugUuid)}
              hasOrdersError={Boolean(ordersError)}
              onClick={handleFavoriteClick}
              onUnpin={handleUnpin}
            />
          ))}
        </div>
      )}
      {hasSuggestions && (
        <DrugSuggestions
          suggestions={visibleSuggestions}
          swapCandidate={swapCandidate}
          isSwapping={isSwapping}
          hasPinnedOrders={hasFavorites}
          windowInDays={windowInDays}
          scannedOrderCount={scannedOrderCount}
          totalOrderCount={totalOrderCount}
          isTablet={isTablet}
          onHide={hideSuggestion}
          onDismiss={dismissSuggestion}
          onSwap={handleSwap}
          onKeepCurrent={hideSwapPrompt}
        />
      )}
    </div>
  );
};

export default DrugFavoritesListExtension;
