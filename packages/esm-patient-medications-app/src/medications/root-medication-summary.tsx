import React from 'react';
import MedicationsSummary from '../medications-summary/medications-summary.component';
import styles from '../root.scss';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';

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
