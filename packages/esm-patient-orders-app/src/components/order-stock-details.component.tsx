import React from 'react';
import { useOrderStockInfo } from '../hooks/useOrderStockInfo';
import { CheckmarkFilled, CloseFilled } from '@carbon/react/icons';
import styles from './order-stock-details.scss';

interface OrderStockDetailsComponentProps {
  orderItemUuid: string;
}

const OrderStockDetailsComponent: React.FC<OrderStockDetailsComponentProps> = ({ orderItemUuid }) => {
  const { data: stockData } = useOrderStockInfo(orderItemUuid);

  if (!stockData) {
    return <div>Loading stock...</div>;
  }

  const isInStock = stockData.entry[0].resource.status === 'active';

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
