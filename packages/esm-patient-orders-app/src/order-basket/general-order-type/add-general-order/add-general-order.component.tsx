import React, { type ComponentProps, useCallback, useMemo, useRef, useState } from 'react';
import { Button, Search } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  ResponsiveWrapper,
  useConfig,
  useDebounce,
  useLayoutType,
  type Visit,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { type OrderBasketItem, useOrderBasket, useOrderType } from '@openmrs/esm-patient-common-lib';
import { OrderForm } from '../general-order-form/general-order-form.component';
import { prepOrderPostData } from '../resources';
import { type ConfigObject } from '../../../config-schema';
import OrderableConceptSearchResults from './search-results.component';
import styles from './orderable-concept-search.scss';

interface AddGeneralOrderProps {
  initialOrder: OrderBasketItem;
  orderTypeUuid: string;
  patient: fhir.Patient;
  visitContext: Visit;
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
}

/**
 * This workspace displays the order form for adding or editing a general order.
 */
const AddGeneralOrder: React.FC<AddGeneralOrderProps> = ({
  initialOrder,
  orderTypeUuid,
  patient,
  visitContext,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders } = useOrderBasket<OrderBasketItem>(patient, orderTypeUuid, prepOrderPostData);
  const { orderTypes } = useConfig<ConfigObject>();
  const [currentOrder, setCurrentOrder] = useState(initialOrder);
  const [searchTerm, setSearchTerm] = useState('');
  const { orderType } = useOrderType(orderTypeUuid);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isEditingExistingOrder = currentOrder?.action === 'REVISE' || initialOrder != null;

  const title = useMemo(() => {
    if (orderType) {
      if (initialOrder?.action === 'REVISE') {
        return t(`editOrderableForOrderType`, 'Edit {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      } else {
        return t(`addOrderableForOrderType`, 'Add {{orderTypeDisplay}}', {
          orderTypeDisplay: orderType.display.toLocaleLowerCase(),
        });
      }
    } else {
      return '';
    }
  }, [orderType, t, initialOrder?.action]);

  const orderableConceptSets = useMemo(
    () => orderTypes.find((orderType) => orderType.orderTypeUuid === orderTypeUuid).orderableConceptSets,
    [orderTypeUuid, orderTypes],
  );

  const openOrderForm = useCallback(
    (order: OrderBasketItem) => {
      const existingOrder = orders.find((prevOrder) => ordersEqual(prevOrder, order));
      if (existingOrder) {
        setCurrentOrder(existingOrder);
      } else {
        setCurrentOrder(order);
      }
    },
    [orders],
  );

  return (
    <Workspace2 title={title} hasUnsavedChanges={hasUnsavedChanges}>
      <div className={styles.workspaceWrapper}>
        {!isTablet && (
          <div className={styles.backButton}>
            <Button
              iconDescription={t('backToOrderBasket', 'Back to order basket')}
              kind="ghost"
              onClick={() => closeWorkspace()}
              renderIcon={(props: ComponentProps<typeof ArrowLeftIcon>) => <ArrowLeftIcon size={24} {...props} />}
              size="sm"
            >
              <span>{t('backToOrderBasket', 'Back to order basket')}</span>
            </Button>
          </div>
        )}
        {currentOrder ? (
          <OrderForm
            initialOrder={currentOrder}
            closeWorkspace={closeWorkspace}
            onCancel={
              isEditingExistingOrder
                ? closeWorkspace
                : () => {
                    setCurrentOrder(undefined);
                    setHasUnsavedChanges(false);
                  }
            }
            setHasUnsavedChanges={setHasUnsavedChanges}
            orderTypeUuid={orderTypeUuid}
            patient={patient}
          />
        ) : (
          <ConceptSearch
            openOrderForm={openOrderForm}
            closeWorkspace={closeWorkspace}
            orderableConceptSets={orderableConceptSets}
            orderTypeUuid={orderTypeUuid}
            patient={patient}
            visit={visitContext}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
          />
        )}
      </div>
    </Workspace2>
  );
};

interface ConceptSearchProps {
  closeWorkspace: Workspace2DefinitionProps['closeWorkspace'];
  openOrderForm: (search: OrderBasketItem) => void;
  orderTypeUuid: string;
  orderableConceptSets: Array<string>;
  patient: fhir.Patient;
  visit: Visit;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

function ConceptSearch({
  closeWorkspace,
  orderTypeUuid,
  openOrderForm,
  orderableConceptSets,
  patient,
  visit,
  searchTerm,
  onSearchTermChange,
}: ConceptSearchProps) {
  const { t } = useTranslation();
  const { orderType } = useOrderType(orderTypeUuid);
  const isTablet = useLayoutType() === 'tablet';
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchInputRef = useRef(null);

  const focusAndClearSearchInput = useCallback(() => {
    onSearchTermChange('');
    searchInputRef.current?.focus();
  }, [onSearchTermChange]);

  const handleSearchTermChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onSearchTermChange(event.target.value ?? ''),
    [onSearchTermChange],
  );

  return (
    <div className={styles.searchPopupContainer}>
      <ResponsiveWrapper>
        <Search
          autoFocus
          size="lg"
          placeholder={t('searchFieldOrder', 'Search for {{orderType}} order', {
            orderType: orderType?.display ?? '',
          })}
          labelText={t('searchFieldOrder', 'Search for {{orderType}} order', {
            orderType: orderType?.display ?? '',
          })}
          onChange={handleSearchTermChange}
          ref={searchInputRef}
          value={searchTerm}
        />
      </ResponsiveWrapper>
      <OrderableConceptSearchResults
        searchTerm={debouncedSearchTerm}
        openOrderForm={openOrderForm}
        focusAndClearSearchInput={focusAndClearSearchInput}
        orderableConceptSets={orderableConceptSets}
        orderTypeUuid={orderTypeUuid}
        closeWorkspace={closeWorkspace}
        patient={patient}
        visit={visit}
      />
      {isTablet && (
        <div className={styles.separatorContainer}>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <Button
            iconDescription={t('returnToOrderBasket', 'Return to order basket')}
            kind="ghost"
            onClick={() => closeWorkspace()}
          >
            {t('returnToOrderBasket', 'Return to order basket')}
          </Button>
        </div>
      )}
    </div>
  );
}

type DrugsOrOrders = Pick<OrderBasketItem, 'action' | 'concept'>;

function ordersEqual(order1: DrugsOrOrders, order2: DrugsOrOrders) {
  return order1.action === order2.action && order1.concept.uuid === order2.concept.uuid;
}

export default AddGeneralOrder;
