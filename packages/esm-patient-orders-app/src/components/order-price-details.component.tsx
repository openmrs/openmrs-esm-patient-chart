import React, { useMemo } from 'react';
import { useOrderPrice } from '../hooks/useOrderPrice';
import styles from './order-price-details.scss';
import { SkeletonText, Tooltip } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { InformationIcon } from '@openmrs/esm-framework';

interface OrderPriceDetailsComponentProps {
  orderItemUuid: string;
}

const OrderPriceDetailsComponent: React.FC<OrderPriceDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { data: priceData, isLoading } = useOrderPrice(orderItemUuid);

  const amount = useMemo(() => {
    if (!priceData || priceData.entry.length === 0) {
      return null;
    }
    return priceData.entry[0].resource.propertyGroup[0]?.priceComponent[0]?.amount;
  }, [priceData]);

  if (isLoading || !priceData) {
    return <SkeletonText width="100px" />;
  }

  if (!amount) {
    return null;
  }

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>{t('price', 'Price')}:</span>
      {`${amount.currency} ${amount.value}`}
      <Tooltip
        align="bottom-left"
        className={styles.priceToolTip}
        label={t(
          'priceDisclaimer',
          'This price is indicative and may not reflect final costs, which could vary due to discounts, insurance coverage, or other pricing rules.',
        )}
      >
        <button className={styles.priceToolTipTrigger} type="button">
          <InformationIcon size={16} />
        </button>
      </Tooltip>
    </div>
  );
};

export default OrderPriceDetailsComponent;
