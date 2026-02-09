import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, InlineNotification, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp, Pin, TrashCan } from '@carbon/react/icons';
import { EditIcon, showModal, useConfig, useLayoutType, type Visit } from '@openmrs/esm-framework';
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
  favoriteKey: string;
  isEditMode: boolean;
  isSelected: boolean;
  isTablet: boolean;
  anyStrengthLabel: string;
  onToggleSelection: (e: React.MouseEvent, key: string) => void;
  onUnpin: (favorite: DrugFavoriteOrder) => void;
  onClick: (favorite: DrugFavoriteOrder) => void;
  onEdit: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
}

const FavoriteListItem: React.FC<FavoriteListItemProps> = React.memo(
  ({
    favorite,
    favoriteKey,
    isEditMode,
    isSelected,
    isTablet,
    anyStrengthLabel,
    onToggleSelection,
    onUnpin,
    onClick,
    onEdit,
  }) => {
    const { t } = useTranslation();

    return (
      <div
        className={styles.favoriteItem}
        onClick={() => !isEditMode && onClick(favorite)}
        role="button"
        tabIndex={0}
        aria-label={favorite.displayName}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isEditMode) {
            onClick(favorite);
          }
        }}
      >
        {isEditMode ? (
          <button type="button" className={styles.pinButton} onClick={(e) => onToggleSelection(e, favoriteKey)}>
            <Pin className={isSelected ? styles.pinIconSelected : styles.pinIcon} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.pinButton}
            onClick={(e) => {
              e.stopPropagation();
              onUnpin(favorite);
            }}
          >
            <Pin className={styles.pinIcon} />
          </button>
        )}
        <div className={styles.itemContent}>
          <p className={styles.itemTitle}>{favorite.displayName}</p>
          <p className={styles.itemDetails}>{formatDrugInfo(favorite, anyStrengthLabel)}</p>
        </div>
        {!isEditMode && (
          <IconButton
            kind="ghost"
            size={isTablet ? 'md' : 'sm'}
            label={t('editPinnedOrder', 'Edit pinned order')}
            onClick={(e: React.MouseEvent) => onEdit(e, favorite)}
            className={styles.editButton}
          >
            <EditIcon />
          </IconButton>
        )}
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
    setSelectedKeys(new Set());
  }, []);

  const toggleSelection = useCallback((favoriteKey: string) => {
    setSelectedKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(favoriteKey)) {
        newSet.delete(favoriteKey);
      } else {
        newSet.add(favoriteKey);
      }
      return newSet;
    });
  }, []);

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
      drugUuid: favorite.drugUuid,
      conceptUuid: favorite.conceptUuid,
      conceptName: favorite.conceptName,
      strength: favorite.attributes.strength,
      dose: favorite.attributes.dose,
      unit: favorite.attributes.unit,
      unitUuid: favorite.attributes.unitUuid,
      route: favorite.attributes.route,
      routeUuid: favorite.attributes.routeUuid,
      frequency: favorite.attributes.frequency,
      frequencyUuid: favorite.attributes.frequencyUuid,
      existingFavorite: favorite,
    });
  }, []);

  const handleToggleSelection = useCallback(
    (e: React.MouseEvent, favoriteKey: string) => {
      e.stopPropagation();
      toggleSelection(favoriteKey);
    },
    [toggleSelection],
  );

  const handleDeleteSelected = useCallback(() => {
    const selectedFavorites = favorites.filter((f) => selectedKeys.has(getFavoriteKey(f)));
    setSelectedKeys(new Set());
    setIsEditMode(false);
    const dispose = showModal(MODAL_NAMES.DELETE_FAVORITES, {
      closeModal: () => dispose(),
      favorites: selectedFavorites,
    });
  }, [favorites, selectedKeys]);

  const handleUnpin = useCallback(
    (favorite: DrugFavoriteOrder) => {
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
      <button
        type="button"
        className={styles.header}
        onClick={toggleCollapsed}
        aria-label={
          isCollapsed
            ? t('expandPinnedOrders', 'Expand pinned orders')
            : t('collapsePinnedOrders', 'Collapse pinned orders')
        }
      >
        <span className={styles.headerTitle}>{t('myPinnedDrugOrders', 'My pinned drug orders')}</span>
        {!isCollapsed && (
          <>
            {isEditMode && selectedKeys.size > 0 && (
              <Button
                kind="danger--ghost"
                size={isTablet ? 'md' : 'sm'}
                renderIcon={TrashCan}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleDeleteSelected();
                }}
              >
                {t('deleteSelected', 'Delete ({{total}})', { total: selectedKeys.size })}
              </Button>
            )}
            <Button
              kind="ghost"
              size={isTablet ? 'md' : 'sm'}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                toggleEditMode();
              }}
            >
              {isEditMode ? t('done', 'Done') : t('edit', 'Edit')}
            </Button>
          </>
        )}
        <div className={styles.headerActions}>
          <span className={styles.chevronButton}>
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </span>
        </div>
      </button>
      {!isCollapsed && (
        <div className={styles.listContainer}>
          {favorites.map((favorite) => {
            const key = getFavoriteKey(favorite);
            return (
              <FavoriteListItem
                key={key}
                favorite={favorite}
                favoriteKey={key}
                isEditMode={isEditMode}
                isSelected={selectedKeys.has(key)}
                isTablet={isTablet}
                anyStrengthLabel={anyStrengthLabel}
                onToggleSelection={handleToggleSelection}
                onUnpin={handleUnpin}
                onClick={handleFavoriteClick}
                onEdit={handleEditItem}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DrugFavoritesListExtension;
