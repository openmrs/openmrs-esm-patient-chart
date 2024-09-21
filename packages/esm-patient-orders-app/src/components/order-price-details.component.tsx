import React from 'react';
import { useOrderPrice } from '../hooks/useOrderPrice';
import styles from './order-price-details.scss';
import { SkeletonText, Tooltip } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

interface OrderPriceDetailsComponentProps {
  code: string;
}

const OrderPriceDetailsComponent: React.FC<OrderPriceDetailsComponentProps> = ({ code }) => {
  const { t } = useTranslation();
  const priceData = useOrderPrice(code);
  // console.log(code);

  if (!priceData) {
    return <SkeletonText width="100px" />;
  }

  const { amount } = priceData.entry[0].resource.propertyGroup[0].priceComponent[0];

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>Price:</span>
      {amount.currency} {amount.value.toFixed(2)}
      <Tooltip align="bottom" className={styles.priceToolTip} label={t('orderBasePrice', 'Base price')}>
        <button className={styles.priceToolTipTrigger} type="button">
          <Information />
        </button>
      </Tooltip>
    </div>
  );
};

export default OrderPriceDetailsComponent;
