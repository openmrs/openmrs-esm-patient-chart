import React from 'react';
import OrderBasket from '../order-basket/order-basket.component';
import { Provider } from 'unistore/react';
import { orderBasketStore } from './order-basket-store';

export interface RootOrderBasketProps {
  patientUuid: string;
  closeWorkspace(): void;
}

export default function RootOrderBasket({ patientUuid, closeWorkspace }: RootOrderBasketProps) {
  return (
    <Provider store={orderBasketStore}>
      <OrderBasket patientUuid={patientUuid} closeWorkspace={closeWorkspace} />
    </Provider>
  );
}
