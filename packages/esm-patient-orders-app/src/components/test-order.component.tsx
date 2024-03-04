import React from 'react';
import styles from './test-order.scss';
import { type Order } from '@openmrs/esm-patient-common-lib';

interface TestOrderProps {
  testOrder: Order;
}

const TestOrder: React.FC<TestOrderProps> = ({ testOrder }) => {
  return (
    <div className={styles.testOrder}>
      <p>{testOrder.concept.display}</p>
    </div>
  );
};

export default TestOrder;
