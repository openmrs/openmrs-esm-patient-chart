import React from 'react';
import styles from './floating-order-basket-button.scss';
import ShoppingBag16 from '@carbon/icons-react/es/shopping--bag/16';
import { Button, Tag } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { connect } from 'unistore/react';
import { OrderBasketStoreActions, OrderBasketStore } from '../medications/order-basket-store';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

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
        launchPatientWorkspace('order-basket-workspace');
      }}
    >
      <div className={styles.elementContainer}>
        <span>{t('orderBasket', 'Order Basket')}</span>
        <ShoppingBag16 />
        {items.length > 0 && <Tag className={styles.countTag}>{items.length}</Tag>}
      </div>
    </Button>
  );
});

export default FloatingOrderBasketButton;
