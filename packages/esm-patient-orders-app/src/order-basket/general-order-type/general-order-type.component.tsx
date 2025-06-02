import React, { type ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Tile } from '@carbon/react';
import classNames from 'classnames';
import styles from './general-order-panel.scss';
import {
  AddIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  type DefaultWorkspaceProps,
  MaybeIcon,
  useLayoutType,
  launchWorkspace,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type OrderBasketItem, useOrderBasket, useOrderType } from '@openmrs/esm-patient-common-lib';
import OrderBasketItemTile from './order-basket-item-tile.component';
import { prepOrderPostData } from './resources';
import { type OrderTypeDefinition } from '../../config-schema';

interface GeneralOrderTypeProps extends OrderTypeDefinition {
  closeWorkspace: DefaultWorkspaceProps['closeWorkspace'];
}

const GeneralOrderType: React.FC<GeneralOrderTypeProps> = ({ orderTypeUuid, closeWorkspace, label, icon }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orderType, isLoadingOrderType } = useOrderType(orderTypeUuid);

  const { orders, setOrders } = useOrderBasket<OrderBasketItem>(orderTypeUuid, prepOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const {
    incompleteOrderBasketItems,
    newOrderBasketItems,
    renewedOrderBasketItems,
    revisedOrderBasketItems,
    discontinuedOrderBasketItems,
  } = useMemo(() => {
    const incompleteOrderBasketItems: Array<OrderBasketItem> = [];
    const newOrderBasketItems: Array<OrderBasketItem> = [];
    const renewedOrderBasketItems: Array<OrderBasketItem> = [];
    const revisedOrderBasketItems: Array<OrderBasketItem> = [];
    const discontinuedOrderBasketItems: Array<OrderBasketItem> = [];

    orders.forEach((order) => {
      if (order?.isOrderIncomplete) {
        incompleteOrderBasketItems.push(order);
      } else if (order.action === 'NEW') {
        newOrderBasketItems.push(order);
      } else if (order.action === 'RENEW') {
        renewedOrderBasketItems.push(order);
      } else if (order.action === 'REVISE') {
        revisedOrderBasketItems.push(order);
      } else if (order.action === 'DISCONTINUE') {
        discontinuedOrderBasketItems.push(order);
      }
    });

    return {
      incompleteOrderBasketItems,
      newOrderBasketItems,
      renewedOrderBasketItems,
      revisedOrderBasketItems,
      discontinuedOrderBasketItems,
    };
  }, [orders]);

  const openConceptSearch = () => {
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () =>
        launchWorkspace('orderable-concept-workspace', {
          orderTypeUuid,
        }),
      closeWorkspaceGroup: false,
    });
  };

  const openOrderForm = (order: OrderBasketItem) => {
    closeWorkspace({
      ignoreChanges: true,
      onWorkspaceClose: () =>
        launchWorkspace('orderable-concept-workspace', {
          order,
          orderTypeUuid,
        }),
      closeWorkspaceGroup: false,
    });
  };

  const removeOrder = useCallback(
    (order: OrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  useEffect(() => {
    setIsExpanded(orders.length > 0);
  }, [orders]);

  if (isLoadingOrderType) {
    return null;
  }

  return (
    <Tile
      className={classNames(isTablet ? styles.tabletTile : styles.desktopTile, { [styles.collapsedTile]: !isExpanded })}
    >
      <div className={styles.container}>
        <div className={styles.iconAndLabel}>
          <MaybeIcon icon={icon ? icon : 'omrs-icon-generic-order-type'} size={isTablet ? 40 : 24} />
          <h4 className={styles.heading}>{`${label ? t(label) : orderType?.display} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            className={styles.addButton}
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof AddIcon>) => <AddIcon size={16} {...props} />}
            iconDescription="Add medication"
            onClick={openConceptSearch}
            size={isTablet ? 'md' : 'sm'}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            className={styles.chevron}
            hasIconOnly
            kind="ghost"
            renderIcon={(props: ComponentProps<typeof ChevronUpIcon>) =>
              isExpanded ? <ChevronUpIcon size={16} {...props} /> : <ChevronDownIcon size={16} {...props} />
            }
            iconDescription="View"
            disabled={orders.length === 0}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {t('add', 'Add')}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <>
          {incompleteOrderBasketItems.length > 0 && (
            <>
              {incompleteOrderBasketItems.map((order, index) => (
                <OrderBasketItemTile
                  key={index}
                  orderBasketItem={order}
                  onItemClick={() => openOrderForm(order)}
                  onRemoveClick={() => removeOrder(order)}
                />
              ))}
            </>
          )}
          {newOrderBasketItems.length > 0 && (
            <>
              {newOrderBasketItems.map((order, index) => (
                <OrderBasketItemTile
                  key={index}
                  orderBasketItem={order}
                  onItemClick={() => openOrderForm(order)}
                  onRemoveClick={() => removeOrder(order)}
                />
              ))}
            </>
          )}

          {renewedOrderBasketItems.length > 0 && (
            <>
              {renewedOrderBasketItems.map((item, index) => (
                <OrderBasketItemTile
                  key={index}
                  orderBasketItem={item}
                  onItemClick={() => openOrderForm(item)}
                  onRemoveClick={() => removeOrder(item)}
                />
              ))}
            </>
          )}

          {revisedOrderBasketItems.length > 0 && (
            <>
              {revisedOrderBasketItems.map((item, index) => (
                <OrderBasketItemTile
                  key={index}
                  orderBasketItem={item}
                  onItemClick={() => openOrderForm(item)}
                  onRemoveClick={() => removeOrder(item)}
                />
              ))}
            </>
          )}

          {discontinuedOrderBasketItems.length > 0 && (
            <>
              {discontinuedOrderBasketItems.map((item, index) => (
                <OrderBasketItemTile
                  key={index}
                  orderBasketItem={item}
                  onItemClick={() => openOrderForm(item)}
                  onRemoveClick={() => removeOrder(item)}
                />
              ))}
            </>
          )}
        </>
      )}
    </Tile>
  );
};

export default GeneralOrderType;
