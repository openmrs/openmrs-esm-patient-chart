import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { Add, ChevronDown, ChevronUp } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { launchPatientWorkspace, OrderBasketItem, useOrderBasket } from '@openmrs/esm-patient-common-lib';
import { LabOrderBasketItemTile } from './lab-order-basket-item-tile.component';
import { prepLabOrderPostData } from '../api';
import LabIcon from './lab-icon.component';
import styles from './lab-order-basket-panel.scss';

/**
 * Designs: https://app.zeplin.io/project/60d59321e8100b0324762e05/screen/648c44d9d4052c613e7f23da
 */
export default function LabOrderBasketPanelExtension() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { orders, setOrders } = useOrderBasket('labs', prepLabOrderPostData);
  const [isExpanded, setIsExpanded] = useState(orders.length > 0);

  const openNewLabForm = useCallback(() => {
    launchPatientWorkspace('add-lab-order');
  }, []);

  const openEditLabForm = useCallback((order: OrderBasketItem) => {
    launchPatientWorkspace('add-lab-order', { order });
  }, []);

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

  return (
    <Tile
      className={classNames(isTablet ? styles.tabletTile : styles.desktopTile, { [styles.collapsedTile]: !isExpanded })}
    >
      <div className={styles.heading}>
        <div className={styles.title}>
          <div className={classNames(isTablet ? styles.tabletIcon : styles.desktopIcon)}>
            <LabIcon isTablet={isTablet} />
          </div>
          <h4>{`${t('labOrders', 'Lab orders')} (${orders.length})`}</h4>
        </div>
        <div className={styles.buttonContainer}>
          <Button
            kind="ghost"
            renderIcon={(props) => <Add size={16} {...props} />}
            iconDescription="Add lab order"
            onClick={openNewLabForm}
            size={isTablet ? 'lg' : 'sm'}
          >
            {t('add', 'Add')}
          </Button>
          <Button
            className={styles.chevron}
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
          {orders.length > 0 && (
            <>
              {orders.map((order, index) => (
                <LabOrderBasketItemTile
                  key={index}
                  orderBasketItem={order}
                  onItemClick={() => openEditLabForm(order)}
                  onRemoveClick={() => removeOrder(order)}
                />
              ))}
            </>
          )}
        </>
      )}
    </Tile>
  );
}
