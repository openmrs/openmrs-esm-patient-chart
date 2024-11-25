import React, { type ComponentProps, useCallback } from 'react';
import { launchPatientWorkspace, useOrderBasket, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import {
  ArrowRightIcon,
  type DefaultWorkspaceProps,
  ShoppingCartArrowDownIcon,
  useLayoutType,
  useSession,
} from '@openmrs/esm-framework';
import { ShoppingCartArrowUp } from '@carbon/react/icons';
import { useMemo } from 'react';
import classNames from 'classnames';
import { Tile } from '@carbon/react';
import { Button } from '@carbon/react';
import { SkeletonText } from '@carbon/react';
import { ButtonSkeleton } from '@carbon/react';
import styles from './search-results.scss';
import { createEmptyOrder, prepOrderPostData } from '../resources';
import { useOrderableConceptSets, type OrderableConcept } from '@openmrs/esm-patient-common-lib';

interface OrderableConceptSearchResultsProps {
  searchTerm: string;
  openOrderForm: (order: OrderBasketItem) => void;
  focusAndClearSearchInput: () => void;
  cancelOrder: () => void;
  orderableConceptClasses: Array<string>;
  orderableConceptSets: Array<string>;
  orderTypeUuid: string;
  closeWorkspace: DefaultWorkspaceProps['closeWorkspace'];
}

const OrderableConceptSearchResults: React.FC<OrderableConceptSearchResultsProps> = ({
  searchTerm,
  openOrderForm,
  focusAndClearSearchInput,
  cancelOrder,
  orderableConceptClasses,
  orderableConceptSets,
  orderTypeUuid,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { concepts, isLoading, error } = useOrderableConceptSets(
    searchTerm,
    orderableConceptClasses,
    orderableConceptSets,
  );

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

  if (concepts?.length) {
    return (
      <>
        <div className={styles.container}>
          {searchTerm && (
            <div className={styles.orderBasketSearchResultsHeader}>
              <span className={styles.searchResultsCount}>
                {t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
                  count: concepts?.length,
                  searchTerm,
                })}
              </span>
              <Button kind="ghost" onClick={focusAndClearSearchInput} size={isTablet ? 'md' : 'sm'}>
                {t('clearSearchResults', 'Clear results')}
              </Button>
            </div>
          )}
          <div className={styles.resultsContainer}>
            {concepts.map((concept) => (
              <TestTypeSearchResultItem
                key={concept.uuid}
                openOrderForm={openOrderForm}
                concept={concept}
                orderTypeUuid={orderTypeUuid}
                closeWorkspace={closeWorkspace}
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

interface TestTypeSearchResultItemProps {
  concept: OrderableConcept;
  openOrderForm: (searchResult: OrderBasketItem) => void;
  orderTypeUuid: string;
  closeWorkspace: DefaultWorkspaceProps['closeWorkspace'];
}

const TestTypeSearchResultItem: React.FC<TestTypeSearchResultItemProps> = ({
  concept,
  openOrderForm,
  orderTypeUuid,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const { orders, setOrders } = useOrderBasket<OrderBasketItem>(orderTypeUuid, prepOrderPostData);

  const orderAlreadyInBasket = useMemo(
    () => orders?.some((order) => order.concept.uuid === concept.uuid),
    [orders, concept],
  );

  const createOrderBasketItem = useCallback(
    (testType: OrderableConcept) => {
      return createEmptyOrder(testType, session.currentProvider?.uuid);
    },
    [session.currentProvider.uuid],
  );

  const addToBasket = useCallback(() => {
    const orderBasketItem = createOrderBasketItem(concept);
    orderBasketItem.isOrderIncomplete = true;
    setOrders([...orders, orderBasketItem]);
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
    });
  }, [orders, setOrders, createOrderBasketItem, concept, closeWorkspace]);

  const removeFromBasket = useCallback(() => {
    setOrders(orders.filter((order) => order?.concept?.uuid !== concept?.uuid));
  }, [setOrders, orders, concept?.uuid]);

  return (
    <Tile
      className={classNames(styles.searchResultTile, { [styles.tabletSearchResultTile]: isTablet })}
      role="listitem"
    >
      <div className={classNames(styles.searchResultTileContent, styles.text02)}>
        <p>
          <span className={styles.heading}>{concept.display}</span>{' '}
        </p>
      </div>
      <div className={styles.searchResultActions}>
        {orderAlreadyInBasket ? (
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
          onClick={() => openOrderForm(createOrderBasketItem(concept))}
        >
          {t('goToDrugOrderForm', 'Order form')}
        </Button>
      </div>
    </Tile>
  );
};

export default OrderableConceptSearchResults;
