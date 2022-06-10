import React from 'react';
import { Provider } from 'unistore/react';
import MedicationsSummary from '../medications-summary/medications-summary.component';
import { orderBasketStore } from './order-basket-store';
import styles from '../root.scss';

export interface RootMedicationSummaryProps {
  patientUuid: string;
}

export default function RootMedicationSummary({ patientUuid }: RootMedicationSummaryProps) {
  return (
    <div>
      <Provider store={orderBasketStore}>
        <MedicationsSummary patientUuid={patientUuid} />
      </Provider>
    </div>
  );
}
