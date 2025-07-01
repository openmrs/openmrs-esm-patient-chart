import React, { useMemo } from 'react';
import { CheckmarkFilledIcon, CloseFilledIcon } from '@openmrs/esm-framework';
import { useOrderStockInfo } from '../hooks/useOrderStockInfo';
import styles from './order-stock-details.scss';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';

interface OrderStockDetailsComponentProps {
  orderItemUuid: string;
}

const OrderStockDetailsComponent: React.FC<OrderStockDetailsComponentProps> = ({ orderItemUuid }) => {
  const { t } = useTranslation();
  const { data: stockData, isLoading, error } = useOrderStockInfo(orderItemUuid);

  const isInStock = useMemo(() => {
    if (!stockData?.entry?.length) {
      return false;
    }
    const resource = stockData.entry[0]?.resource;
    return (
      resource?.status === 'active' && typeof resource?.netContent?.value === 'number' && resource.netContent.value > 0
    );
  }, [stockData]);

  if (isLoading) {
    return <SkeletonText width="100px" />;
  }

  if (!stockData?.entry || error) {
    return null;
  }

  return (
    <div>
      {isInStock ? (
        <div className={styles.itemInStock}>
          <CheckmarkFilledIcon size={16} className={styles.itemInStockIcon} /> {t('inStock', 'In stock')}
        </div>
      ) : (
        <div className={styles.itemOutOfStock}>
          <CloseFilledIcon size={16} className={styles.itemOutOfStockIcon} /> {t('outOfStock', 'Out of stock')}
        </div>
      )}
    </div>
  );
};

export default OrderStockDetailsComponent;
