import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, InlineNotification, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp, PinFilled } from '@carbon/react/icons';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import type { FormEntryConfigSchema } from '../config-schema';
import type { Form } from '../types';
import type { FormFavorite } from './form-favorites.resource';
import { useFormFavoritesActions } from './useFormFavoritesActions';
import styles from './form-favorites-list.scss';

interface FormFavoritesListProps {
  onFormSelect: (form: Form, encounterUuid: string) => void;
}

interface FavoriteListItemProps {
  favorite: FormFavorite;
  isTablet: boolean;
  onClick: (favorite: FormFavorite) => void;
  onUnpin: (e: React.MouseEvent, favorite: FormFavorite) => void;
}

const FavoriteListItem: React.FC<FavoriteListItemProps> = React.memo(({ favorite, isTablet, onClick, onUnpin }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.favoriteItem}>
      <button type="button" className={styles.itemButton} onClick={() => onClick(favorite)}>
        <div className={styles.itemContent}>
          <p className={styles.itemTitle}>{favorite.displayName}</p>
        </div>
      </button>
      <IconButton
        kind="ghost"
        size={isTablet ? 'md' : 'sm'}
        label={t('unpinForm', 'Unpin form')}
        align="left"
        className={styles.pinButton}
        onClick={(e: React.MouseEvent) => onUnpin(e, favorite)}
      >
        <PinFilled className={styles.pinIcon} />
      </IconButton>
    </div>
  );
});

const FormFavoritesList: React.FC<FormFavoritesListProps> = ({ onFormSelect }) => {
  const { t } = useTranslation();
  const { enableFormFavorites } = useConfig<FormEntryConfigSchema>();
  const isTablet = useLayoutType() === 'tablet';
  const { favorites, error, isLoading, deleteMultipleFavorites } = useFormFavoritesActions();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  const handleFavoriteClick = useCallback(
    (favorite: FormFavorite) => {
      // Build a minimal Form object from the stored favorite so the caller
      // can open the form workspace without requiring a full API round-trip.
      const form: Form = {
        uuid: favorite.formUuid,
        name: favorite.displayName,
        display: favorite.displayName,
        version: '',
        published: true,
        retired: false,
        resources: [],
      };
      onFormSelect(form, '');
    },
    [onFormSelect],
  );

  const handleUnpin = useCallback(
    (e: React.MouseEvent, favorite: FormFavorite) => {
      e.stopPropagation();
      deleteMultipleFavorites([favorite]);
    },
    [deleteMultipleFavorites],
  );

  if (!enableFormFavorites) {
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
          title={t('errorLoadingPinnedForms', 'Error loading pinned forms')}
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
        <span className={styles.headerTitle}>{t('myPinnedForms', 'My pinned forms')}</span>
        <IconButton
          kind="ghost"
          size="sm"
          align="left"
          label={
            isCollapsed
              ? t('expandPinnedForms', 'Expand pinned forms')
              : t('collapsePinnedForms', 'Collapse pinned forms')
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
              key={favorite.id}
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

export default FormFavoritesList;
