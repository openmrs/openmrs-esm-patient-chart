import React, { useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, Layer, Search, SkeletonText, Tile } from '@carbon/react';
import { ArrowRight, ShoppingCartArrowDown, ShoppingCartArrowUp } from '@carbon/react/icons';
import { useDebounce, useLayoutType, useSession } from '@openmrs/esm-framework';
import { closeWorkspace, launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { LabOrderBasketItem, prepLabOrderPostData } from '../api';
import { type TestType, useTestTypes } from './useTestTypes';
import { createEmptyLabOrder } from './lab-order';
import styles from './test-type-search.scss';

export interface TestTypeSearchProps {
  openLabForm: (searchResult: LabOrderBasketItem) => void;
}

export function TestTypeSearch({ openLabForm }: TestTypeSearchProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value ?? '');
  };

  return (
    <>
      <ResponsiveWrapper isTablet={isTablet}>
        <Search
          size="lg"
          placeholder={t('searchFieldPlaceholder', 'Search for a test type')}
          labelText={t('searchFieldPlaceholder', 'Search for a test type')}
          onChange={handleSearchTermChange}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <TestTypeSearchResults
        searchTerm={debouncedSearchTerm}
        openOrderForm={openLabForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
      />
    </>
  );
}

function ResponsiveWrapper({ children, isTablet }: { children: React.ReactNode; isTablet: boolean }) {
  return isTablet ? <Layer>{children} </Layer> : <>{children}</>;
}

interface TestTypeSearchResultsProps {
  searchTerm: string;
  openOrderForm: (searchResult: LabOrderBasketItem) => void;
  focusAndClearSearchInput: () => void;
}

function TestTypeSearchResults({ searchTerm, openOrderForm, focusAndClearSearchInput }: TestTypeSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { testTypes, isLoading, error } = useTestTypes(searchTerm);

  if (isLoading) {
    return <TestTypeSearchSkeleton />;
  }

  if (error) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>
            {t('errorFetchingTestTypes', 'Error fetching results for "{{searchTerm}}"', {
              searchTerm,
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
      {testTypes?.length ? (
        <div className={styles.container}>
          {searchTerm && (
            <div className={styles.orderBasketSearchResultsHeader}>
              <span className={styles.searchResultsCount}>
                {t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
                  count: testTypes?.length,
                  searchTerm,
                })}
              </span>
              <Button kind="ghost" onClick={focusAndClearSearchInput} size={isTablet ? 'md' : 'sm'}>
                {t('clearSearchResults', 'Clear Results')}
              </Button>
            </div>
          )}
          <div className={styles.resultsContainer}>
            {testTypes.map((testType) => (
              <TestTypeSearchResultItem key={testType.conceptUuid} testType={testType} openOrderForm={openOrderForm} />
            ))}
          </div>
        </div>
      ) : (
        <Tile className={styles.emptyState}>
          <div>
            <h4 className={styles.productiveHeading01}>
              {t('noResultsForTestTypeSearch', 'No results to display for "{{searchTerm}}"', {
                searchTerm,
              })}
            </h4>
            <p className={styles.bodyShort01}>
              <span>{t('tryTo', 'Try to')}</span>{' '}
              <span className={styles.link} role="link" tabIndex={0} onClick={focusAndClearSearchInput}>
                {t('searchAgain', 'search again')}
              </span>{' '}
              <span>{t('usingADifferentTerm', 'using a different term')}</span>
            </p>
          </div>
        </Tile>
      )}
      <hr className={classNames(styles.divider, isTablet ? styles.tabletDivider : styles.desktopDivider)} />
    </>
  );
}

interface TestTypeSearchResultItemProps {
  testType: TestType;
  openOrderForm: (searchResult: LabOrderBasketItem) => void;
}

const TestTypeSearchResultItem: React.FC<TestTypeSearchResultItemProps> = ({ testType, openOrderForm }) => {
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<LabOrderBasketItem>('labs', prepLabOrderPostData);
  const testTypeAlreadyInBasket = useMemo(
    () => orders?.some((order) => order.testType.conceptUuid === testType.conceptUuid),
    [orders, testType],
  );

  const createLabOrder = useCallback(
    (testType: TestType) => {
      return createEmptyLabOrder(testType, session.currentProvider.uuid);
    },
    [session.currentProvider.uuid],
  );

  const { t } = useTranslation();

  const addToBasket = useCallback(() => {
    const labOrder = createLabOrder(testType);
    setOrders([...orders, labOrder]);
    closeWorkspace('add-lab-order', true);
    launchPatientWorkspace('order-basket');
  }, [orders, setOrders, createLabOrder, testType]);

  const removeFromBasket = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid != testType.conceptUuid));
  }, [orders, setOrders, testType.conceptUuid]);

  return (
    <Tile
      className={classNames(styles.searchResultTile, { [styles.tabletSearchResultTile]: isTablet })}
      key={testType.conceptUuid}
      role="listitem"
    >
      <div className={classNames(styles.searchResultTileContent, styles.text02)}>
        <p>
          <span className={styles.productiveHeading01}>{testType.label}</span>{' '}
        </p>
      </div>
      <div className={styles.searchResultActions}>
        {testTypeAlreadyInBasket ? (
          <Button
            kind="danger--ghost"
            renderIcon={(props) => <ShoppingCartArrowUp size={16} {...props} />}
            onClick={() => removeFromBasket()}
          >
            {t('removeFromBasket', 'Remove from basket')}
          </Button>
        ) : (
          <Button
            kind="ghost"
            renderIcon={(props) => <ShoppingCartArrowDown size={16} {...props} />}
            onClick={() => addToBasket()}
          >
            {t('directlyAddToBasket', 'Add to basket')}
          </Button>
        )}
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={() => openOrderForm(createLabOrder(testType))}
        >
          {t('goToDrugOrderForm', 'Order form')}
        </Button>
      </div>
    </Tile>
  );
};

const TestTypeSearchSkeleton = () => {
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
      <hr className={classNames(styles.divider, isTablet ? styles.tabletDivider : styles.desktopDivider)} />
    </div>
  );
};
