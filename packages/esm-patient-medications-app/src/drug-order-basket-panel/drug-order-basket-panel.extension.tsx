import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { Add, ChevronDown, ChevronUp } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { prepMedicationOrderPostData } from '../api/api';
import type { DrugOrderBasketItem } from '../types';
import OrderBasketItemTile from './order-basket-item-tile.component';
import RxIcon from './rx-icon.component';
import styles from './drug-order-basket-panel.scss';

/**
 * Designs: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/62c6bb9500e7671a618efa56
 */
export default function DrugOrderBasketPanelExtension() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket<DrugOrderBasketItem>('medications', prepMedicationOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);
  const newOrderBasketItems = orders.filter((x) => x.action === 'NEW');
  const renewedOrderBasketItems = orders.filter((x) => x.action === 'RENEW');
  const revisedOrderBasketItems = orders.filter((x) => x.action === 'REVISE');
  const discontinuedOrderBasketItems = orders.filter((x) => x.action === 'DISCONTINUE');

  const openDrugSearch = () => {
    launchPatientWorkspace('add-drug-order');
  };

  const openDrugForm = (order: DrugOrderBasketItem) => {
    launchPatientWorkspace('add-drug-order', { order });
  };

  const removeMedication = useCallback(
    (order: DrugOrderBasketItem) => {
      const newOrders = [...orders];
      newOrders.splice(orders.indexOf(order), 1);
      setOrders(newOrders);
    },
    [orders, setOrders],
  );

  useEffect(() => {
    setIsExpanded(orders.length > 0);
  }, [orders]);

  return (
    <Tile className={`${isTablet ? styles.tabletTile : styles.desktopTile} ${!isExpanded && styles.collapsedTile}`}>
      <div className={styles.heading}>
        <div className={styles.title}>
          <div className={`${isTablet ? styles.tabletIcon : styles.desktopIcon}`}>
            <RxIcon isTablet={isTablet} />
          </div>
          <h4>{`${t('drugOrders', 'Drug orders')} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add medication"
            onClick={openDrugSearch}
            size={isTablet ? 'lg' : 'sm'}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            hasIconOnly
            kind="ghost"
            renderIcon={(props) =>
              isExpanded ? <ChevronUp size={16} {...props} /> : <ChevronDown size={16} {...props} />
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
          {newOrderBasketItems.length > 0 && (
            <>
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
        </>
      )}
    </Tile>
  );
}
