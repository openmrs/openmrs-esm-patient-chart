import React from 'react';
import { useOrderStockInfo } from '../hooks/useOrderStockInfo';
import { CheckmarkFilled, CloseFilled } from '@carbon/react/icons';
import styles from './order-stock-details.scss';
import { SkeletonText } from '@carbon/react';

interface OrderStockDetailsComponentProps {
  orderItemUuid: string;
}

const OrderStockDetailsComponent: React.FC<OrderStockDetailsComponentProps> = ({ orderItemUuid }) => {
  const { data: stockData, isLoading } = useOrderStockInfo(orderItemUuid);

  if (isLoading || !stockData) {
    return <SkeletonText width="100px" />;
  }

  const isInStock = stockData.entry[0]?.resource.status === 'active';

  return (
    <div>
      {isInStock ? (
        <div className={styles.itemInStock}>
          <CheckmarkFilled size={16} /> In Stock
        </div>
      ) : (
        <div className={styles.itemOutOfStock}>
          <CloseFilled size={16} /> Out of Stock
        </div>
      )}
    </div>
  );
};

export default OrderStockDetailsComponent;
