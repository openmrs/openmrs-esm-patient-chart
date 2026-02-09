import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, Layer, OverflowMenu, OverflowMenuItem, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp, Pin, TrashCan } from '@carbon/react/icons';
import { showModal, useLayoutType } from '@openmrs/esm-framework';
import type { Drug, DrugOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { getFavoriteKey } from './drug-favorites.resource';
import { useFavoritesActions } from './useFavoritesActions';
import { MODAL_NAMES } from './constants';
import type { DrugFavoriteOrder } from './types';
import styles from './drug-favorites-list.scss';

interface DrugFavoritesListExtensionProps {
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  isSearching?: boolean;
}

const formatDrugInfo = (favorite: DrugFavoriteOrder, anyStrengthLabel: string): string => {
  const parts: string[] = [];

  if (favorite.drugUuid && favorite.attributes.strength) {
    parts.push(favorite.attributes.strength);
  } else if (favorite.conceptUuid) {
    parts.push(anyStrengthLabel);
  }

  if (favorite.attributes.dose && favorite.attributes.unit) {
    parts.push(`${favorite.attributes.dose} ${favorite.attributes.unit}`);
  } else if (favorite.attributes.unit) {
    parts.push(favorite.attributes.unit);
  }

  if (favorite.attributes.route) parts.push(favorite.attributes.route);
  if (favorite.attributes.frequency) parts.push(favorite.attributes.frequency);

  return parts.join(' — ');
};

const createDrugFromFavorite = (favorite: DrugFavoriteOrder): Drug => {
  if (!favorite.drugUuid) {
    throw new Error('Cannot create drug from a concept-based favorite.');
  }
  const attrs = favorite.attributes;

  return {
    uuid: favorite.drugUuid,
    display: favorite.displayName,
    strength: attrs.strength,
    dosageForm:
      attrs.dosageFormDisplay && attrs.dosageFormUuid
        ? { display: attrs.dosageFormDisplay, uuid: attrs.dosageFormUuid }
        : undefined,
    concept: favorite.conceptUuid
      ? { uuid: favorite.conceptUuid, display: favorite.conceptName || favorite.displayName }
      : undefined,
  } as Drug;
};

const buildBasketItem = (drug: Drug, favorite: DrugFavoriteOrder): DrugOrderBasketItem => {
  const attrs = favorite.attributes;

  return {
    action: 'NEW',
    display: drug.display,
    drug,
    commonMedicationName: favorite.displayName,
    // Pre-fill from favorite attributes
    dosage: attrs.dose ? parseFloat(attrs.dose) : null,
    unit: attrs.unit && attrs.unitUuid ? { value: attrs.unit, valueCoded: attrs.unitUuid } : null,
    route: attrs.route && attrs.routeUuid ? { value: attrs.route, valueCoded: attrs.routeUuid } : null,
    frequency:
      attrs.frequency && attrs.frequencyUuid ? { value: attrs.frequency, valueCoded: attrs.frequencyUuid } : null,
    quantityUnits: drug.dosageForm ? { value: drug.dosageForm.display, valueCoded: drug.dosageForm.uuid } : null,
    // Default values for fields not saved in favorites
    isFreeTextDosage: false,
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: null,
    startDate: new Date(),
    duration: null,
    durationUnit: null,
    pillsDispensed: null,
    numRefills: null,
    freeTextDosage: '',
    indication: '',
  } as DrugOrderBasketItem;
};

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
  onDelete: (e: React.MouseEvent, favorite: DrugFavoriteOrder) => void;
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
    onDelete,
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
          <Layer className={styles.menuLayer}>
            <OverflowMenu
              aria-label={t('editOrDeletePinnedOrder', 'Edit or delete pinned order')}
              align="left"
              size={isTablet ? 'lg' : 'sm'}
              flipped
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <OverflowMenuItem
                id="editPinnedOrder"
                onClick={(e: React.MouseEvent) => onEdit(e, favorite)}
                itemText={t('edit', 'Edit')}
              />
              <OverflowMenuItem
                id="deletePinnedOrder"
                itemText={t('delete', 'Delete')}
                onClick={(e: React.MouseEvent) => onDelete(e, favorite)}
                isDelete
                hasDivider
              />
            </OverflowMenu>
          </Layer>
        )}
      </div>
    );
  },
);

const DrugFavoritesListExtension: React.FC<DrugFavoritesListExtensionProps> = ({
  openOrderForm,
  isSearching = false,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { favorites, error, isLoading, deleteMultipleFavorites } = useFavoritesActions();

  const [isCollapsed, setIsCollapsed] = useState(isSearching);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setIsCollapsed(isSearching);
  }, [isSearching]);

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
        openOrderForm(buildBasketItem(drug, favorite));
        return;
      }

      if (favorite.conceptUuid && favorite.conceptName) {
        const dispose = showModal(MODAL_NAMES.STRENGTH_PICKER, {
          closeModal: () => dispose(),
          conceptUuid: favorite.conceptUuid,
          conceptName: favorite.conceptName,
          onSelectDrug: (selectedDrug: Drug) => {
            const basketItem = buildBasketItem(selectedDrug, favorite);
            openOrderForm(basketItem);
          },
        });
      }
    },
    [openOrderForm],
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

  const handleDeleteItem = useCallback(
    (e: React.MouseEvent, favorite: DrugFavoriteOrder) => {
      e.stopPropagation();
      deleteMultipleFavorites([favorite]);
    },
    [deleteMultipleFavorites],
  );

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
                onDelete={handleDeleteItem}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DrugFavoritesListExtension;
