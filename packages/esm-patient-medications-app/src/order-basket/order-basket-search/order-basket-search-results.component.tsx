import React, { useMemo, useState } from 'react';
import { Button, ClickableTile, Tile, SkeletonText, Loading, InlineNotification, ButtonSkeleton } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useLayoutType, usePagination } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../../types/order-basket-item';
import { ConfigObject } from '../../config-schema';
import styles from './order-basket-search-results.scss';
import { getDefault, getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search.resource';
import { Drug } from '../../types/order';

export interface OrderBasketSearchResultsProps {
  searchTerm: string;
  encounterUuid: string;
  setSearchTerm: (value: string) => void;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearchResults({
  searchTerm,
  encounterUuid,
  setSearchTerm,
  onSearchResultClicked,
}: OrderBasketSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { drugs, isLoading, error } = useDrugSearch(searchTerm);

  return searchTerm ? (
    <>
      {isLoading ? (
        <Skeleton />
      ) : drugs?.length ? (
        <div className={styles.container}>
          <div className={styles.orderBasketSearchResultsHeader}>
            <span className={styles.searchResultsCount}>
              {t('searchResultsExactMatchesForTerm', '{count} exact match(es) for "{searchTerm}"', {
                count: drugs?.length,
                searchTerm,
              })}
            </span>
            <Button kind="ghost" onClick={() => setSearchTerm('')} size={isTablet ? 'md' : 'sm'}>
              {t('clearSearchResults', 'Clear Results')}
            </Button>
          </div>
          {drugs.map((drug) => (
            <DrugSearchResultItem key={drug.uuid} drug={drug} onSearchResultClicked={onSearchResultClicked} />
          ))}
          <hr className={`${styles.divider} ${isTablet ? `${styles.tabletDivider}` : `${styles.desktopDivider}`}`} />
        </div>
      ) : (
        <InlineNotification
          kind="error"
          lowContrast={true}
          title={t('errorFetchingDrugResults', 'Error fetching drugs')}
          subtitle={t('trySearchingDrugsAgain', 'Please try searching again')}
          caption={error?.message}
        />
      )}
    </>
  ) : null;
}

interface DrugSearchResultItemProps {
  drug: Drug;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

const DrugSearchResultItem: React.FC<DrugSearchResultItemProps> = ({ drug, onSearchResultClicked }) => {
  const isTablet = useLayoutType() === 'tablet';
  const {
    templates,
    isLoading: isLoadingTemplates,
    error: fetchingDrugOrderTemplatesError,
  } = useDrugTemplate(drug?.uuid);
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const orderItems: Array<OrderBasketItem> = useMemo(
    () =>
      templates?.length
        ? templates.map((template) => getTemplateOrderBasketItem(drug, config?.daysDurationUnit, template))
        : [getTemplateOrderBasketItem(drug, config?.daysDurationUnit)],
    [templates, drug, config?.daysDurationUnit],
  );

  const handleSearchResultClicked = (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
    onSearchResultClicked(searchResult, directlyAddToBasket);
  };

  return (
    <>
      {orderItems.map((orderItem, indx) => (
        <ClickableTile
          key={templates?.length ? templates[indx]?.uuid : drug?.uuid}
          role="listitem"
          className={isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`}
          onClick={() => handleSearchResultClicked(orderItem, false)}
        >
          <div className={styles.searchResultTile}>
            <div className={styles.searchResultTileContent}>
              <p>
                <strong>{drug?.display}</strong> {drug?.strength && <>&mdash; {drug?.strength}</>}{' '}
                {drug?.dosageForm?.display && <>&mdash; {drug?.dosageForm?.display}</>}
              </p>
              {fetchingDrugOrderTemplatesError ? (
                <p>
                  <span className={styles.errorLabel}>
                    {t('errorFetchingDrugOrderTemplates', 'Error fetching drug order templates')}
                  </span>
                </p>
              ) : (
                <p>
                  {orderItem?.frequency?.value && <span className={styles.label01}>{orderItem?.frequency?.value}</span>}
                  {orderItem?.route?.value && <span className={styles.label01}>&mdash; {orderItem?.route?.value}</span>}
                </p>
              )}
            </div>
            <Button
              className={styles.addToBasketButton}
              kind="ghost"
              hasIconOnly={true}
              renderIcon={(props) => <ShoppingCart size={16} {...props} />}
              iconDescription={t('directlyAddToBasket', 'Immediately add to basket')}
              onClick={() => handleSearchResultClicked(orderItem, true)}
            />
          </div>
        </ClickableTile>
      ))}
    </>
  );
};

const Skeleton = () => {
  const isTablet = useLayoutType() === 'tablet';
  return (
    <div className={styles.searchResultSkeletonWrapper}>
      <div className={styles.orderBasketSearchResultsHeader}>
        <SkeletonText className={styles.searchResultCntSkeleton} />
        <ButtonSkeleton size={isTablet ? 'md' : 'sm'} />
      </div>
      <Tile
        className={`${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
          styles.skeletonTile
        }`}
        onClick={() => {}}
      >
        <SkeletonText />
      </Tile>

      <Tile
        className={`${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
          styles.skeletonTile
        }`}
        onClick={() => {}}
      >
        <SkeletonText />
      </Tile>
      <Tile
        className={`${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
          styles.skeletonTile
        }`}
        onClick={() => {}}
      >
        <SkeletonText />
      </Tile>
      <Tile
        className={`${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
          styles.skeletonTile
        }`}
        onClick={() => {}}
      >
        <SkeletonText />
      </Tile>
      <hr className={`${styles.divider} ${isTablet ? `${styles.tabletDivider}` : `${styles.desktopDivider}`}`} />
    </div>
  );
};
