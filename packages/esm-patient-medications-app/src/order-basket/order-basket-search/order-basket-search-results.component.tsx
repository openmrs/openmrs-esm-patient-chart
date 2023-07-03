import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ClickableTile, Tile, SkeletonText, InlineNotification, ButtonSkeleton } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useConfig, useLayoutType, UserHasAccess } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../../types/order-basket-item';
import { ConfigObject } from '../../config-schema';
import styles from './order-basket-search-results.scss';
import { getTemplateOrderBasketItem, useDrugSearch, useDrugTemplate } from './drug-search.resource';
import { Drug } from '../../types/order';
import debounce from 'lodash/debounce';

export interface OrderBasketSearchResultsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearchResultClicked: (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => void;
}

export default function OrderBasketSearchResults({
  searchTerm,
  setSearchTerm,
  onSearchResultClicked,
}: OrderBasketSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [currentTerm, setCurrentTerm] = useState(searchTerm);

  useEffect(() => {
    const debouncedSetCurrentTerm = debounce((term) => {
      setCurrentTerm(term);
    }, 300);

    debouncedSetCurrentTerm(searchTerm);

    return () => debouncedSetCurrentTerm.cancel();
  }, [searchTerm]);

  const { drugs, isLoading, error } = useDrugSearch(currentTerm);

  if (!currentTerm) {
    return null;
  }

  if (isLoading) {
    return <DrugSearchSkeleton />;
  }

  if (error) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>
            {t('errorFetchingDrugResults', 'Error fetching results for "{currentTerm}"', {
              currentTerm,
            })}
          </h4>
          <p className={styles.bodyShort01}>
            <span>{t('trySearchingAgain', 'Please try searching again')}</span>
          </p>
        </div>
      </Tile>
    );
  }

  return (
    <>
      {drugs?.length ? (
        <div className={styles.container}>
          <div className={styles.orderBasketSearchResultsHeader}>
            <span className={styles.searchResultsCount}>
              {t('searchResultsMatchesForTerm', '{count} result{plural} for "{currentTerm}"', {
                count: drugs?.length,
                currentTerm,
                plural: drugs?.length > 1 ? 's' : '',
              })}
            </span>
            <Button kind="ghost" onClick={() => setSearchTerm('')} size={isTablet ? 'md' : 'sm'}>
              {t('clearSearchResults', 'Clear Results')}
            </Button>
          </div>
          <div className={styles.resultsContainer}>
            {drugs.map((drug) => (
              <DrugSearchResultItem key={drug.uuid} drug={drug} onSearchResultClicked={onSearchResultClicked} />
            ))}
          </div>
        </div>
      ) : (
        <Tile className={styles.emptyState}>
          <div>
            <h4 className={styles.productiveHeading01}>
              {t('noResultsForDrugSearch', 'No results to display for "{currentTerm}"', {
                currentTerm,
              })}
            </h4>
            <p className={styles.bodyShort01}>
              <span>{t('tryTo', 'Try to')}</span>{' '}
              <span className={styles.link} role="link" tabIndex={0} onClick={() => setSearchTerm('')}>
                {t('searchAgain', 'search again')}
              </span>{' '}
              <span>{t('usingADifferentTerm', 'using a different term')}</span>
            </p>
          </div>
        </Tile>
      )}
      <hr className={`${styles.divider} ${isTablet ? `${styles.tabletDivider}` : `${styles.desktopDivider}`}`} />
    </>
  );
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
            <div className={`${styles.searchResultTileContent} ${styles.text02}`}>
              <p>
                <span className={styles.productiveHeading01}>{drug?.display}</span>{' '}
                {drug?.strength && <>&mdash; {drug?.strength.toLowerCase()}</>}{' '}
                {drug?.dosageForm?.display && <>&mdash; {drug?.dosageForm?.display.toLowerCase()}</>}
              </p>
              <UserHasAccess privilege="Manage OrderTemplates">
                {fetchingDrugOrderTemplatesError ? (
                  <p>
                    <span className={styles.errorLabel}>
                      {t('errorFetchingDrugOrderTemplates', 'Error fetching drug order templates')}
                    </span>
                  </p>
                ) : (
                  <p>
                    {orderItem?.frequency?.value && (
                      <span className={styles.label01}>{orderItem?.frequency?.value.toLowerCase()}</span>
                    )}
                    {orderItem?.route?.value && (
                      <span className={styles.label01}>&mdash; {orderItem?.route?.value.toLowerCase()}</span>
                    )}
                  </p>
                )}
              </UserHasAccess>
            </div>
            <Button
              className={styles.addToBasketButton}
              kind="ghost"
              hasIconOnly={true}
              renderIcon={(props) => <ShoppingCart size={16} {...props} />}
              iconDescription={t('directlyAddToBasket', 'Immediately add to basket')}
              onClick={() => handleSearchResultClicked(orderItem, true)}
              tooltipPosition="left"
              tooltipAlignment="end"
            />
          </div>
        </ClickableTile>
      ))}
    </>
  );
};

const DrugSearchSkeleton = () => {
  const isTablet = useLayoutType() === 'tablet';
  const tileClassName = `${isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`} ${
    styles.skeletonTile
  }`;
  return (
    <div className={styles.searchResultSkeletonWrapper}>
      <div className={styles.orderBasketSearchResultsHeader}>
        <SkeletonText className={styles.searchResultCntSkeleton} />
        <ButtonSkeleton size={isTablet ? 'md' : 'sm'} />
      </div>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <Tile className={tileClassName}>
        <SkeletonText />
      </Tile>
      <hr className={`${styles.divider} ${isTablet ? `${styles.tabletDivider}` : `${styles.desktopDivider}`}`} />
    </div>
  );
};
