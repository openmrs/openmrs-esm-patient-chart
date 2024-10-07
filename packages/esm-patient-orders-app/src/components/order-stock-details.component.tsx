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
  const { data: stockData, isLoading } = useOrderStockInfo(orderItemUuid);

  const isInStock = useMemo(() => {
    if (!stockData || stockData.entry.length === 0) {
      return false;
    }
    const resource = stockData.entry[0]?.resource;
    return resource.status === 'active' && resource.netContent?.value > 0;
  }, [stockData]);

  if (isLoading || !stockData) {
    return <SkeletonText width="100px" />;
  }

  return (
    <div>
      {isInStock ? (
        <div className={styles.itemInStock}>
          <CheckmarkFilledIcon size={16} /> {t('inStock', 'In Stock')}
        </div>
      ) : (
        <div className={styles.itemOutOfStock}>
          <CloseFilledIcon size={16} /> {t('outOfStock', 'Out of Stock')}
        </div>
      )}
    </div>
  );
};

export default OrderStockDetailsComponent;
