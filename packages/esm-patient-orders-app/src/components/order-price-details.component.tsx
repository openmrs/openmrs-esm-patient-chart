import React from 'react';
import { useOrderPrice } from '../hooks/useOrderPrice';
import styles from './order-price-details.scss';
import { SkeletonText, Tooltip } from '@carbon/react';
import { Information } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';

interface OrderPriceDetailsComponentProps {
  orderItemUuid: string;
}

const OrderPriceDetailsComponent: React.FC<OrderPriceDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { data: priceData, isLoading } = useOrderPrice(orderItemUuid);

  if (isLoading || !priceData) {
    return <SkeletonText width="100px" />;
  }

  const { amount } = priceData.entry[0].resource.propertyGroup[0].priceComponent[0];

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>Price:</span>
      {amount.currency} {amount.value}
      <Tooltip
        align="bottom-left"
        className={styles.priceToolTip}
        label={t(
          'priceDisclaimer',
          'This price is indicative and may not reflect final costs, which could vary due to discounts, insurance coverage, or other pricing rules.',
        )}
      >
        <button className={styles.priceToolTipTrigger} type="button">
          <Information />
        </button>
      </Tooltip>
    </div>
  );
};

export default OrderPriceDetailsComponent;
