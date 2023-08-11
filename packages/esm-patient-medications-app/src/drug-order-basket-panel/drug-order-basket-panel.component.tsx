import React, { useCallback, useState } from 'react';
import { launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { Button, Tile } from '@carbon/react';
import { Add, ChevronDown, ChevronUp } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useLayoutType } from '@openmrs/esm-framework';
import type { OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import OrderBasketItemTile from './order-basket-item-tile.component';
import styles from './drug-order-basket-panel.scss';
import RxIcon from './rx-icon.component';

export default function DrugOrderPanel({}) {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket('medications');
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const newOrderBasketItems = orders.filter((x) => x.action === 'NEW');
  const renewedOrderBasketItems = orders.filter((x) => x.action === 'RENEWED');
  const revisedOrderBasketItems = orders.filter((x) => x.action === 'REVISE');
  const discontinuedOrderBasketItems = orders.filter((x) => x.action === 'DISCONTINUE');

  const openDrugSearch = () => {
    launchPatientWorkspace('add-drug-order');
  }

  const openDrugForm = (order: OrderBasketItem) => {
    launchPatientWorkspace('add-drug-order', { order });
  };

  const removeMedication = useCallback(
    (order: OrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  return (
    <Tile className={`${isTablet ? styles.tabletTile : styles.desktopTile} ${!isExpanded && styles.collapsedTile}`}>
      <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
        <div className={styles.title}>
          <div className={styles.headingIcon}>
            <RxIcon />
          </div>
          <h4>{`${t('drugOrders', 'Drug orders')} (${orders.length})`}</h4>
        </div>
        <div>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add medication"
            onClick={openDrugSearch}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            hasIconOnly
            kind="ghost"
            renderIcon={(props) => isExpanded ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />}
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
                {t('ordersAlreadyInBasketWithCount', '{count} item(s) are in your basket', {
                  count: newOrderBasketItems.length,
                })}
              </h4>
            )}
            {newOrderBasketItems.map((order, index) => (
              <OrderBasketItemTile
                key={index}
                orderBasketItem={order}
                onItemClick={() => openDrugForm(order)}
                onRemoveClick={() => removeMedication(order)}
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
                onItemClick={() => openDrugForm(item)}
                onRemoveClick={() => removeMedication(item)}
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
                onItemClick={() => openDrugForm(item)}
                onRemoveClick={() => removeMedication(item)}
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
                onItemClick={() => openDrugForm(item)}
                onRemoveClick={() => removeMedication(item)}
              />
            ))}
          </>
        )}
      </>)}
    </Tile>
  );
}
