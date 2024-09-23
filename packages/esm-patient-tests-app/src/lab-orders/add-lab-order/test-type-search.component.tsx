import React, { type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, Search, SkeletonText, Tile } from '@carbon/react';
import { ShoppingCartArrowUp } from '@carbon/react/icons';
import {
  ArrowRightIcon,
  closeWorkspace,
  ExtensionSlot,
  ResponsiveWrapper,
  ShoppingCartArrowDownIcon,
  useDebounce,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { type LabOrderBasketItem, launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { type TestType, useTestTypes } from './useTestTypes';
import { prepLabOrderPostData } from '../api';
import { createEmptyLabOrder } from './lab-order';
import styles from './test-type-search.scss';

interface TestTypeSearchResultsProps {
  cancelOrder: () => void;
  searchTerm: string;
  openOrderForm: (searchResult: LabOrderBasketItem) => void;
  focusAndClearSearchInput: () => void;
}

interface TestTypeSearchResultItemProps {
  t: TFunction;
  testType: TestType;
  openOrderForm: (searchResult: LabOrderBasketItem) => void;
}

export interface TestTypeSearchProps {
  openLabForm: (searchResult: LabOrderBasketItem) => void;
}

export function TestTypeSearch({ openLabForm }: TestTypeSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const cancelOrder = useCallback(() => {
    closeWorkspace('add-lab-order', {
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, []);

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value ?? '');
  };

  return (
    <>
      <ResponsiveWrapper>
        <Search
          autoFocus
          labelText={t('searchFieldPlaceholder', 'Search for a test type')}
          onChange={handleSearchTermChange}
          placeholder={t('searchFieldPlaceholder', 'Search for a test type')}
          ref={searchInputRef}
          size="lg"
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <TestTypeSearchResults
        cancelOrder={cancelOrder}
        focusAndClearSearchInput={focusAndClearSearchInput}
        openOrderForm={openLabForm}
        searchTerm={debouncedSearchTerm}
      />
    </>
  );
}

function TestTypeSearchResults({
  cancelOrder,
  searchTerm,
  openOrderForm,
  focusAndClearSearchInput,
}: TestTypeSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { testTypes, isLoading, error } = useTestTypes();

  const filteredTestTypes = useMemo(() => {
    if (!searchTerm) {
      return testTypes;
    }

    if (searchTerm && searchTerm.trim() !== '') {
      return testTypes?.filter((testType) =>
        testType.synonyms.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }
  }, [searchTerm, testTypes]);

  if (isLoading) {
    return <TestTypeSearchSkeleton />;
  }

  if (error) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.heading}>
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

  if (filteredTestTypes?.length) {
    return (
      <>
        <div className={styles.container}>
          {searchTerm && (
            <div className={styles.orderBasketSearchResultsHeader}>
              <span className={styles.searchResultsCount}>
                {t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
                  count: filteredTestTypes?.length,
                  searchTerm,
                })}
              </span>
              <Button kind="ghost" onClick={focusAndClearSearchInput} size={isTablet ? 'md' : 'sm'}>
                {t('clearSearchResults', 'Clear results')}
              </Button>
            </div>
          )}
          <div className={styles.resultsContainer}>
            {filteredTestTypes.map((testType) => (
              <TestTypeSearchResultItem
                key={testType.conceptUuid}
                openOrderForm={openOrderForm}
                t={t}
                testType={testType}
              />
            ))}
          </div>
        </div>
        {isTablet && (
          <div className={styles.separatorContainer}>
            <p className={styles.separator}>{t('or', 'or')}</p>
            <Button iconDescription="Return to order basket" kind="ghost" onClick={cancelOrder}>
              {t('returnToOrderBasket', 'Return to order basket')}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <Tile className={styles.emptyState}>
      <div>
        <h4 className={styles.heading}>
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
  );
}

const TestTypeSearchResultItem: React.FC<TestTypeSearchResultItemProps> = ({ t, testType, openOrderForm }) => {
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<LabOrderBasketItem>('labs', prepLabOrderPostData);

  const testTypeAlreadyInBasket = useMemo(
    () => orders?.some((order) => order.testType.conceptUuid === testType.conceptUuid),
    [orders, testType],
  );

  const createLabOrder = useCallback(
    (testType: TestType) => {
      return createEmptyLabOrder(testType, session.currentProvider?.uuid);
    },
    [session.currentProvider.uuid],
  );

  const addToBasket = useCallback(() => {
    const labOrder = createLabOrder(testType);
    labOrder.isOrderIncomplete = true;
    setOrders([...orders, labOrder]);
    closeWorkspace('add-lab-order', {
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [orders, setOrders, createLabOrder, testType]);

  const removeFromBasket = useCallback(() => {
    setOrders(orders.filter((order) => order.testType.conceptUuid !== testType.conceptUuid));
  }, [orders, setOrders, testType.conceptUuid]);

  return (
    <Tile
      className={classNames(styles.searchResultTile, { [styles.tabletSearchResultTile]: isTablet })}
      role="listitem"
    >
      <div className={classNames(styles.searchResultTileContent, styles.text02)}>
        <p>
          <span className={styles.heading}>{testType.label}</span>{' '}
        </p>
        <ExtensionSlot
          name="order-tem-additional-info-slot"
          state={{ orderItemUuid: testType.conceptUuid }}
          className={styles.priceAndStockContainer}
        />
      </div>
      <div className={styles.searchResultActions}>
        {testTypeAlreadyInBasket ? (
          <Button
            kind="danger--ghost"
            renderIcon={(props) => <ShoppingCartArrowUp size={16} {...props} />}
            onClick={removeFromBasket}
          >
            {t('removeFromBasket', 'Remove from basket')}
          </Button>
        ) : (
          <Button
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof ShoppingCartArrowDownIcon>) => (
              <ShoppingCartArrowDownIcon size={16} {...props} />
            )}
            onClick={addToBasket}
          >
            {t('directlyAddToBasket', 'Add to basket')}
          </Button>
        )}
        <Button
          kind="ghost"
          renderIcon={(props: ComponentProps<typeof ArrowRightIcon>) => <ArrowRightIcon size={16} {...props} />}
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
  const tileClassName = classNames({
    [styles.tabletSearchResultTile]: isTablet,
    [styles.desktopSearchResultTile]: !isTablet,
    [styles.skeletonTile]: true,
  });
  const buttonSize = isTablet ? 'md' : 'sm';

  return (
    <div className={styles.searchResultSkeletonWrapper}>
      <div className={styles.orderBasketSearchResultsHeader}>
        <SkeletonText className={styles.searchResultCntSkeleton} />
        <ButtonSkeleton size={buttonSize} />
      </div>
      {[...Array(4)].map((_, index) => (
        <Tile key={index} className={tileClassName}>
          <SkeletonText />
        </Tile>
      ))}
    </div>
  );
};
