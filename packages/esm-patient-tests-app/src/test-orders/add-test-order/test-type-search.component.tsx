import React, { type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, Search, SkeletonText, Tile } from '@carbon/react';
import { ShoppingCartArrowUp } from '@carbon/react/icons';
import FavoriteStar from '../../favorites/FavoriteStar';
import {
  ArrowRightIcon,
  ResponsiveWrapper,
  ShoppingCartArrowDownIcon,
  useDebounce,
  useLayoutType,
  useSession,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { useOrderBasket, type TestOrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { prepTestOrderPostData } from '../api';
import { createEmptyLabOrder } from './test-order';
import { useTestTypes, type TestType } from './useTestTypes';
import styles from './test-type-search.scss';

export interface TestTypeSearchProps {
  openLabForm: (searchResult: TestOrderBasketItem) => void;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  patient: fhir.Patient;
  visit: Visit;
}

interface TestTypeSearchResultsProps extends TestTypeSearchProps {
  searchTerm: string;
  focusAndClearSearchInput: () => void;
  patient: fhir.Patient;
}

interface TestTypeSearchResultItemProps {
  orderTypeUuid: string;
  testType: TestType;
  openOrderForm: (searchResult: TestOrderBasketItem) => void;
  patient: fhir.Patient;
  visit: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

export function TestTypeSearch({
  patient,
  visit,
  openLabForm,
  orderTypeUuid,
  orderableConceptSets,
  closeWorkspace,
}: TestTypeSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = useCallback(() => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  }, [setSearchTerm]);

  const handleSearchTermChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value ?? '');
    },
    [setSearchTerm],
  );

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
        closeWorkspace={closeWorkspace}
        orderTypeUuid={orderTypeUuid}
        orderableConceptSets={orderableConceptSets}
        focusAndClearSearchInput={focusAndClearSearchInput}
        openLabForm={openLabForm}
        searchTerm={debouncedSearchTerm}
        patient={patient}
        visit={visit}
      />
    </>
  );
}

function TestTypeSearchResults({
  closeWorkspace,
  searchTerm,
  orderTypeUuid,
  orderableConceptSets,
  openLabForm,
  focusAndClearSearchInput,
  patient,
  visit,
}: TestTypeSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { testTypes, isLoading, error } = useTestTypes(searchTerm, orderableConceptSets);

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

  if (testTypes?.length) {
    return (
      <>
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
                {t('clearSearchResults', 'Clear results')}
              </Button>
            </div>
          )}
          <div className={styles.resultsContainer}>
            {testTypes.map((testType) => (
              <TestTypeSearchResultItem
                key={testType.conceptUuid}
                orderTypeUuid={orderTypeUuid}
                openOrderForm={openLabForm}
                testType={testType}
                closeWorkspace={closeWorkspace}
                patient={patient}
                visit={visit}
              />
            ))}
          </div>
        </div>
        {isTablet && (
          <div className={styles.separatorContainer}>
            <p className={styles.separator}>{t('or', 'or')}</p>
            <Button
              iconDescription="Return to order basket"
              kind="ghost"
              onClick={() => closeWorkspace({ discardUnsavedChanges: true })}
            >
              {t('back', 'Back')}
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

const TestTypeSearchResultItem: React.FC<TestTypeSearchResultItemProps> = ({
  testType,
  openOrderForm,
  orderTypeUuid,
  closeWorkspace,
  patient,
  visit,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<TestOrderBasketItem>(patient, orderTypeUuid, prepTestOrderPostData);

  const testTypeAlreadyInBasket = useMemo(
    () => orders?.some((order) => order.testType.conceptUuid === testType.conceptUuid),
    [orders, testType],
  );

  const createLabOrder = useCallback(
    (orderableConcept: TestType) => {
      return createEmptyLabOrder(orderableConcept, session.currentProvider?.uuid, visit);
    },
    [session.currentProvider.uuid, visit],
  );

  const addToBasket = useCallback(() => {
    const labOrder = createLabOrder(testType);
    labOrder.isOrderIncomplete = true;
    setOrders([...orders, labOrder]);
    closeWorkspace({ discardUnsavedChanges: true });
  }, [orders, setOrders, createLabOrder, testType, closeWorkspace]);

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
          <FavoriteStar uuid={testType.conceptUuid} />
          <span className={styles.heading}>{testType.label}</span>{' '}
        </p>
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
