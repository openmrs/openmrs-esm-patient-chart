import React from 'react';
import Button from 'carbon-components-react/es/components/Button';
import Tag from 'carbon-components-react/es/components/Tag';
import styles from './floating-order-basket-button.scss';
import ShoppingBag16 from '@carbon/icons-react/es/shopping--bag/16';
import { useTranslation } from 'react-i18next';
import { connect } from 'unistore/react';
import { attach } from '@openmrs/esm-framework';
import { OrderBasketStoreActions, OrderBasketStore } from '../medications/order-basket-store';

export interface FloatingOrderBasketButtonProps {}

const FloatingOrderBasketButton = connect<
  FloatingOrderBasketButtonProps,
  OrderBasketStoreActions,
  OrderBasketStore,
  {}
>('items')(({ items }: FloatingOrderBasketButtonProps & OrderBasketStore) => {
  const { t } = useTranslation();

  return (
    <Button
      kind="secondary"
      className={styles.floatingOrderBasketButton}
      style={
        // The OMRS dev tool buttons hide this button. Non-issue in prod, but makes dev harder.
        // Moving it up during development solves this.
        process.env.NODE_ENV === 'production' ? {} : { bottom: '4rem' }
      }
      onClick={() => {
        attach('patient-chart-workspace-slot', 'order-basket-workspace');
      }}>
      <div className={styles.elementContainer}>
        <span>{t('orderBasket', 'Order Basket')}</span>
        <ShoppingBag16 />
        {items.length > 0 && <Tag className={styles.countTag}>{items.length}</Tag>}
      </div>
    </Button>
  );
});

export default FloatingOrderBasketButton;
