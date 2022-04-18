import React, { useEffect, useState } from 'react';
import ShoppingCart16 from '@carbon/icons-react/es/shopping--cart/16';
import styles from './order-basket-search-results.scss';
import { Button, Link, Pagination, ClickableTile } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { createErrorHandler, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { searchMedications } from './drug-search';
import { OrderBasketItem } from '../types/order-basket-item';
import { paginate } from '../utils/pagination';
import { ConfigObject } from '../config-schema';

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
  const [searchResults, setSearchResults] = useState<Array<OrderBasketItem>>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentSearchResultPage] = paginate(searchResults, page, pageSize);
  const config = useConfig() as ConfigObject;

  useEffect(() => {
    const abortController = new AbortController();
    searchMedications(searchTerm, encounterUuid, abortController, config.daysDurationUnit).then(
      setSearchResults,
      createErrorHandler,
    );
    return () => abortController.abort();
  }, [searchTerm, encounterUuid]);

  const handleSearchResultClicked = (searchResult: OrderBasketItem, directlyAddToBasket: boolean) => {
    setSearchTerm('');
    setSearchResults([]);
    onSearchResultClicked(searchResult, directlyAddToBasket);
  };

  return (
    <>
      {!!searchTerm && (
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
                    <strong>{result.drug.concept.display}</strong> &mdash; {result.dosage?.dosage} &mdash;{' '}
                    {result.dosageUnit.name}
                    <br />
                    <span className={styles.label01}>{result.frequency.name}</span> &mdash;{' '}
                    <span className={styles.label01}>{result.route.name}</span>
                  </p>
                </div>
                <Button
                  className={styles.addToBasketButton}
                  kind="ghost"
                  hasIconOnly={true}
                  renderIcon={() => <ShoppingCart16 />}
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
