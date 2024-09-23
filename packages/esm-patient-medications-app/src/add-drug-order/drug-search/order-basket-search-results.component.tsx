import React, { type ComponentProps, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, SkeletonText, Tile } from '@carbon/react';
import { ShoppingCartArrowUp } from '@carbon/react/icons';
import { launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import {
  ArrowRightIcon,
  closeWorkspace,
  ExtensionSlot,
  ShoppingCartArrowDownIcon,
  useConfig,
  useLayoutType,
  usePatient,
  UserHasAccess,
} from '@openmrs/esm-framework';
import { type ConfigObject } from '../../config-schema';
import { prepMedicationOrderPostData, usePatientOrders } from '../../api/api';
import { ordersEqual } from './helpers';
import {
  type DrugSearchResult,
  getTemplateOrderBasketItem,
  useDrugSearch,
  useDrugTemplate,
} from './drug-search.resource';
import type { DrugOrderBasketItem } from '../../types';
import styles from './order-basket-search-results.scss';
import { usePatientChartStore } from '@openmrs/esm-patient-common-lib';

export interface OrderBasketSearchResultsProps {
  searchTerm: string;
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
  focusAndClearSearchInput: () => void;
}

interface DrugSearchResultItemProps {
  drug: DrugSearchResult;
  openOrderForm: (searchResult: DrugOrderBasketItem) => void;
}

export default function OrderBasketSearchResults({
  searchTerm,
  openOrderForm,
  focusAndClearSearchInput,
}: OrderBasketSearchResultsProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { drugs, isLoading, error } = useDrugSearch(searchTerm);

  if (!searchTerm) {
    return <div className={styles.container}></div>;
  }

  if (isLoading) {
    return <DrugSearchSkeleton />;
  }

  if (error) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>
            {t('errorFetchingDrugResults', 'Error fetching results for "{{searchTerm}}"', {
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

  if (drugs?.length === 0) {
    return (
      <Tile className={styles.emptyState}>
        <div>
          <h4 className={styles.productiveHeading01}>
            {t('noResultsForDrugSearch', 'No results to display for "{{searchTerm}}"', {
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

  return (
    <div className={styles.container}>
      <div className={styles.orderBasketSearchResultsHeader}>
        <span className={styles.searchResultsCount}>
          {t('searchResultsMatchesForTerm', '{{count}} results for "{{searchTerm}}"', {
            count: drugs?.length,
            searchTerm,
          })}
        </span>
        <Button kind="ghost" onClick={focusAndClearSearchInput} size={isTablet ? 'md' : 'sm'}>
          {t('clearSearchResults', 'Clear Results')}
        </Button>
      </div>
      <div className={styles.resultsContainer}>
        {drugs?.map((drug) => <DrugSearchResultItem key={drug.uuid} drug={drug} openOrderForm={openOrderForm} />)}
      </div>
    </div>
  );
}

const DrugSearchResultItem: React.FC<DrugSearchResultItemProps> = ({ drug, openOrderForm }) => {
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const { patientUuid } = usePatientChartStore();
  const { data: activeOrders, isLoading: isLoadingActiveOrders } = usePatientOrders(patientUuid);
  const drugAlreadyInBasket = useMemo(
    () => orders?.some((order) => ordersEqual(order, getTemplateOrderBasketItem(drug))),
    [orders, drug],
  );
  const drugAlreadyPrescribed = useMemo(
    () => activeOrders?.some((order) => order.drug.uuid == drug.uuid),
    [activeOrders, drug],
  );

  const {
    templates,
    isLoading: isLoadingTemplates,
    error: fetchingDrugOrderTemplatesError,
  } = useDrugTemplate(drug?.uuid);
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const drugItemTemplateOptions: Array<DrugOrderBasketItem> = useMemo(
    () =>
      templates?.length
        ? templates.map((template) => getTemplateOrderBasketItem(drug, config?.daysDurationUnit, template))
        : [getTemplateOrderBasketItem(drug, config?.daysDurationUnit)],
    [templates, drug, config?.daysDurationUnit],
  );

  const addToBasket = useCallback(
    (searchResult: DrugOrderBasketItem) => {
      // Directly adding the order to basket should be marked as incomplete
      searchResult.isOrderIncomplete = true;
      setOrders([...orders, searchResult]);
      closeWorkspace('add-drug-order', {
        ignoreChanges: true,
        onWorkspaceClose: () => launchPatientWorkspace('order-basket'),
      });
    },
    [orders, setOrders],
  );

  const removeFromBasket = useCallback(
    (searchResult: DrugOrderBasketItem) => {
      setOrders(orders.filter((order) => !ordersEqual(order, searchResult)));
    },
    [orders, setOrders],
  );

  return (
    <>
      {drugItemTemplateOptions.map((orderItem, indx) => (
        <Tile
          key={templates?.length ? templates[indx]?.uuid : drug?.uuid}
          role="listitem"
          className={classNames(styles.searchResultTile, {
            [styles.tabletSearchResultTile]: isTablet,
          })}
        >
          <div className={classNames(styles.searchResultTileContent, styles.text02)}>
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
          <ExtensionSlot
            name="order-item-additional-info-slot"
            state={{ orderItemUuid: orderItem.drug.uuid }}
            className={styles.additionalInfoContainer}
          />
          {!isLoadingActiveOrders ? (
            drugAlreadyPrescribed ? (
              <div className={styles.drugAlreadyPrescribed}>{t('drugAlreadyPrescribed', 'Already prescribed')}</div>
            ) : (
              <div className={styles.searchResultActions}>
                {drugAlreadyInBasket ? (
                  <Button
                    kind="danger--ghost"
                    renderIcon={(props: ComponentProps<typeof ShoppingCartArrowUp>) => (
                      <ShoppingCartArrowUp size={16} {...props} />
                    )}
                    onClick={() => removeFromBasket(orderItem)}
                  >
                    {t('removeFromBasket', 'Remove from basket')}
                  </Button>
                ) : (
                  <Button
                    kind="ghost"
                    renderIcon={(props: ComponentProps<typeof ShoppingCartArrowDownIcon>) => (
                      <ShoppingCartArrowDownIcon size={16} {...props} />
                    )}
                    onClick={() => addToBasket(orderItem)}
                    disabled={drugAlreadyPrescribed}
                  >
                    {t('directlyAddToBasket', 'Add to basket')}
                  </Button>
                )}
                <Button
                  kind="ghost"
                  renderIcon={(props: ComponentProps<typeof ArrowRightIcon>) => <ArrowRightIcon size={16} {...props} />}
                  onClick={() => openOrderForm(orderItem)}
                  disabled={drugAlreadyPrescribed}
                >
                  {t('goToDrugOrderForm', 'Order form')}
                </Button>
              </div>
            )
          ) : null}
        </Tile>
      ))}
    </>
  );
};

const DrugSearchSkeleton = () => {
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
