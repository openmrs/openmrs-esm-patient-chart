import React, { useState } from 'react';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import ShoppingCart16 from '@carbon/icons-react/es/shopping--cart/16';
import styles from './medication-order-action-menu.scss';
import { Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { orderBasketStore } from '../medications/order-basket-store';
import { useLayoutType } from '@openmrs/esm-framework';

interface MedicationActionMenuProps {}

const MedicationOrderActionMenu: React.FC<MedicationActionMenuProps> = () => {
  const [items, setItems] = useState([]);
  orderBasketStore.subscribe(({ items }) => setItems(items));
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  return (
    <>
      {isTablet && (
        <div
          className={styles.orderNavButtonContainer}
          role="button"
          tabIndex={0}
          onClick={() => launchPatientWorkspace('order-basket-workspace')}
        >
          <div className={styles.elementContainer}>
            <ShoppingCart16 /> {items?.length > 0 && <Tag className={styles.countTag}>{items?.length}</Tag>}
          </div>
          <span>{t('orderBasket', 'Order Basket')}</span>
        </div>
      )}
    </>
  );
};

export default MedicationOrderActionMenu;
