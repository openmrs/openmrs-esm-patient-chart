import React, { useEffect, useState } from 'react';
import Medication16 from '@carbon/icons-react/es/medication/16';
import ShoppingBag16 from '@carbon/icons-react/es/shopping--bag/16';
import styles from './order-basket-search-results.scss';
import Button from 'carbon-components-react/es/components/Button';
import Link from 'carbon-components-react/es/components/Link';
import Pagination from 'carbon-components-react/es/components/Pagination';
import { ClickableTile } from 'carbon-components-react/es/components/Tile';
import { useTranslation } from 'react-i18next';
import { createErrorHandler } from '@openmrs/esm-framework';
import { searchMedications } from './drug-search';
import { OrderBasketItem } from '../types/order-basket-item';
import { paginate } from '../utils/pagination';

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
  const [searchResults, setSearchResults] = useState<Array<OrderBasketItem>>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [currentSearchResultPage] = paginate(searchResults, page, pageSize);

  useEffect(() => {
    const abortController = new AbortController();
    searchMedications(searchTerm, encounterUuid, abortController).then(setSearchResults, createErrorHandler);
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
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className={styles.label01}>
              {t('searchResultsExactMatchesForTerm', '{count} exact match(es) for "{searchTerm}"', {
                count: searchResults.length,
                searchTerm,
              })}
            </span>
            <Link onClick={() => setSearchTerm('')}>{t('clearSearchResults', 'Clear Results')}</Link>
          </div>

          {currentSearchResultPage.map((result, index) => (
            <ClickableTile
              key={index}
              className={styles.searchResultTile}
              style={{ marginTop: '5px' }}
              handleClick={() => handleSearchResultClicked(result, false)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Medication16 style={{ flex: '0 0 auto', marginRight: '20px' }} />
                <div style={{ flex: '1 1 auto' }}>
                  <p>
                    <strong>
                      {result.drug.concept.display} ({result.dosage?.dosage})
                    </strong>
                    <br />
                    <span className={styles.label01}>{result.dosageUnit.name}</span> &mdash;{' '}
                    <span className={styles.label01}>{result.frequency.name}</span> &mdash;{' '}
                    <span className={styles.label01}>{result.route.name}</span>
                  </p>
                </div>
                <Button
                  style={{ flex: '0 0 auto' }}
                  kind="ghost"
                  hasIconOnly={true}
                  renderIcon={() => <ShoppingBag16 />}
                  iconDescription={t('directlyAddToBasket', 'Immediately add to basket')}
                  onClick={() => handleSearchResultClicked(result, true)}
                />
              </div>
            </ClickableTile>
          ))}
          {searchResults.length > 0 && (
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
          )}
        </>
      )}
    </>
  );
}
