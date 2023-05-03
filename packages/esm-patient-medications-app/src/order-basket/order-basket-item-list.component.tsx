import React from 'react';
import { Layer, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import { OrderBasketItem } from '../types/order-basket-item';
import OrderBasketItemTile from './order-basket-item.component';
import styles from './order-basket-item-list.scss';

export interface OrderBasketItemListProps {
  orderBasketItems: Array<OrderBasketItem>;
  onItemClicked: (order: OrderBasketItem) => void;
  onItemRemoveClicked: (order: OrderBasketItem) => void;
}

export default function OrderBasketItemList({
  orderBasketItems,
  onItemClicked,
  onItemRemoveClicked,
}: OrderBasketItemListProps) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const newOrderBasketItems = orderBasketItems.filter((x) => x.action === 'NEW');
  const renewedOrderBasketItems = orderBasketItems.filter((x) => x.action === 'RENEWED');
  const revisedOrderBasketItems = orderBasketItems.filter((x) => x.action === 'REVISE');
  const discontinuedOrderBasketItems = orderBasketItems.filter((x) => x.action === 'DISCONTINUE');

  return (
    <div className={isTablet ? `${styles.orderBasketContainerTablet}` : `${styles.orderBasketContainerDesktop}`}>
      {orderBasketItems.length === 0 && (
        <Layer>
          <Tile className={isTablet ? `${styles.tabletTile}` : `${styles.desktopTile}`}>
            <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
              <h4>{t('orderBasket_title', 'Order Basket')}</h4>
            </div>
            <p className={styles.content}>{t('emptyOrderBasket', 'Your basket is empty')}</p>
            <p className={styles.actionText}>{t('searchForAnOrder', 'Search for an order above')}</p>
          </Tile>
        </Layer>
      )}

      {newOrderBasketItems.length > 0 && (
        <>
          {isTablet ? (
            <div className={styles.orderBasketHeader}>
              <h4 className={`${styles.productiveHeading03} ${styles.text02}`}>
                {t('orderBasketWithCount', 'Order basket ({count})', { count: newOrderBasketItems.length })}
              </h4>
            </div>
          ) : (
            <h4 className={styles.orderCategoryHeading}>
              {t('ordersAlreadyInBasketWithCount', '{count} item(s) already in your basket', {
                count: newOrderBasketItems.length,
              })}
            </h4>
          )}
          {newOrderBasketItems.map((order, index) => (
            <OrderBasketItemTile
              key={index}
              orderBasketItem={order}
              onItemClick={() => onItemClicked(order)}
              onRemoveClick={() => onItemRemoveClicked(order)}
            />
          ))}
        </>
      )}

      {renewedOrderBasketItems.length > 0 && (
        <>
          <h4 className={styles.orderCategoryHeading}>
            {t('renewedOrders', '{count} order(s) being renewed (continued)', {
              count: renewedOrderBasketItems.length,
            })}
          </h4>
          {renewedOrderBasketItems.map((item, index) => (
            <OrderBasketItemTile
              key={index}
              orderBasketItem={item}
              onItemClick={() => onItemClicked(item)}
              onRemoveClick={() => onItemRemoveClicked(item)}
            />
          ))}
        </>
      )}

      {revisedOrderBasketItems.length > 0 && (
        <>
          <h4 className={styles.orderCategoryHeading}>
            {t('revisedOrders', '{count} order(s) being modified (revised)', {
              count: revisedOrderBasketItems.length,
            })}
          </h4>
          {revisedOrderBasketItems.map((item, index) => (
            <OrderBasketItemTile
              key={index}
              orderBasketItem={item}
              onItemClick={() => onItemClicked(item)}
              onRemoveClick={() => onItemRemoveClicked(item)}
            />
          ))}
        </>
      )}

      {discontinuedOrderBasketItems.length > 0 && (
        <>
          <h4 className={styles.orderCategoryHeading}>
            {t('discontinuedOrders', '{count} discontinued order(s)', {
              count: discontinuedOrderBasketItems.length,
            })}
          </h4>
          {discontinuedOrderBasketItems.map((item, index) => (
            <OrderBasketItemTile
              key={index}
              orderBasketItem={item}
              onItemClick={() => onItemClicked(item)}
              onRemoveClick={() => onItemRemoveClicked(item)}
            />
          ))}
        </>
      )}
    </div>
  );
}
