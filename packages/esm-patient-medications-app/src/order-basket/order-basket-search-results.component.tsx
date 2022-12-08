import React, { useEffect, useState } from 'react';
import { Button, Link, Pagination, ClickableTile, Tile, SkeletonText, SkeletonIcon } from '@carbon/react';
import { ShoppingCart } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { searchMedications } from './drug-search';
import { OrderBasketItem } from '../types/order-basket-item';
import { paginate } from '../utils/pagination';
import { ConfigObject } from '../config-schema';
import styles from './order-basket-search-results.scss';

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
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<OrderBasketItem>>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentSearchResultPage] = paginate(searchResults, page, pageSize);
  const config = useConfig() as ConfigObject;

  useEffect(() => {
    const abortController = new AbortController();
    if (searchTerm) {
      if (searchTerm.length == 1) {
        setSearchResults([]);
        return;
      }
      setIsLoading(true);
      searchMedications(searchTerm, encounterUuid, abortController, config.daysDurationUnit).then((results) => {
        setIsLoading(false);
        setSearchResults(results);
      }, createErrorHandler);
    }
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleSearchResultClicked = (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
    setSearchTerm('');
    setSearchResults([]);
    onSearchResultClicked(searchResult, directlyAddToBasket);
  };

  return (
    <>
      {!!searchTerm && isLoading && (
        <>
          <DrugOrderSearchResultSkeleton />
          <DrugOrderSearchResultSkeleton />
        </>
      )}
      {!!searchTerm && !isLoading && (
        <div className={styles.container}>
          <div className={styles.orderBasketSearchResultsHeader}>
            <span className={styles.searchResultsCount}>
              {t('searchResultsExactMatchesForTerm', '{count} exact match(es) for "{searchTerm}"', {
                count: searchResults.length,
                searchTerm,
              })}
            </span>
            <Link onClick={() => setSearchTerm('')}>{t('clearSearchResults', 'Clear Results')}</Link>
          </div>
          {currentSearchResultPage.map((result, index) => (
            <ClickableTile
              light={isTablet}
              role="listitem"
              key={index}
              className={isTablet ? `${styles.tabletSearchResultTile}` : `${styles.desktopSearchResultTile}`}
              onClick={() => handleSearchResultClicked(result, false)}
            >
              <div className={styles.searchResultTile}>
                <div className={styles.searchResultTileContent}>
                  <p>
                    <strong>{result.template ? result.drug.concept.display : result.drug.name}</strong>{' '}
                    {result.template && (
                      <>
                        &mdash; {result.dosage} {result.unit?.value} &mdash; {result.drug.dosageForm.display}
                        <br />
                        <span className={styles.label01}>{result.frequency?.value}</span> &mdash;{' '}
                        <span className={styles.label01}>{result.route?.value}</span>
                      </>
                    )}
                  </p>
                </div>
                <Button
                  className={styles.addToBasketButton}
                  kind="ghost"
                  hasIconOnly={true}
                  renderIcon={(props) => <ShoppingCart size={16} {...props} />}
                  iconDescription={t('directlyAddToBasket', 'Immediately add to basket')}
                  onClick={() => handleSearchResultClicked(result, true)}
                />
              </div>
            </ClickableTile>
          ))}
          {searchResults.length > 0 && (
            <>
              <Pagination
                page={page}
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={searchResults.length}
                onChange={({ page, pageSize }) => {
                  setPage(page);
                  setPageSize(pageSize);
                }}
              />
              <hr
                className={`${styles.divider} ${isTablet ? `${styles.tabletDivider}` : `${styles.desktopDivider}`}`}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

const DrugOrderSearchResultSkeleton = () => {
  return (
    <Tile>
      <div className={styles.searchResultSkeletonWrapper}>
        <SkeletonIcon style={{ height: '26px', margin: '0px 15px 10px', width: '23px' }} />
        <SkeletonText lineCount={4} />
      </div>
    </Tile>
  );
};
