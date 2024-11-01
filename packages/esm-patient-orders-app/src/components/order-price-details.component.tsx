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
  const { t, i18n } = useTranslation();
  const { data: priceData, isLoading } = useOrderPrice(orderItemUuid);

  const amount = useMemo(() => {
    if (!priceData || priceData.entry.length === 0) {
      return null;
    }
    return priceData.entry[0].resource.propertyGroup[0]?.priceComponent[0]?.amount;
  }, [priceData]);

  const formatPrice = (
    amount: {
      value: number;
      currency: string;
    },
    locale: string,
  ): string => {
    if (!amount) return '';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: amount.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount.value);
  };

  if (isLoading || !priceData) {
    return <SkeletonText width="100px" data-testid="skeleton-text" />;
  }

  if (!priceData || !amount) {
    return null;
  }

  return (
    <div className={styles.priceDetailsContainer}>
      <span className={styles.priceLabel}>{t('price', 'Price')}:</span>
      {formatPrice(amount, i18n.language)}
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
